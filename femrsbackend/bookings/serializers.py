from rest_framework import serializers
from .models import Booking
from equipmentlisting.models import Equipment
from payments.serializers import PaymentSerializer  # Import PaymentSerializer
from equipmentlisting.serializers import EquipmentSerializer  # Import EquipmentSerializer

class BookingSerializer(serializers.ModelSerializer):
    """
    Serializer for the Booking model.
    """
    equipment = EquipmentSerializer(read_only=True)  # Embed Equipment Data
    user_email = serializers.ReadOnlyField(source='user.email')  # To show user email in response
    owner_email = serializers.ReadOnlyField(source='equipment_owner.email')  # To show owner email in response
    payment = PaymentSerializer(read_only=True)  # Include payment data

    class Meta:
        model = Booking
        fields = [
            'id', 'booking_no', 'user', 'user_email', 'equipment', 
            'shipping_address', 'pincode', 'rental_start_date', 'rental_end_date', 
            'total_days', 'amount_payable', 'created_at', 'payment', 'equipment_owner', 'owner_email'
        ]
        read_only_fields = ['booking_no', 'total_days', 'amount_payable', 'created_at', 'user', 'equipment', 'payment']

    def validate(self, data):
        """
        Custom validation to ensure rental_end_date is not before rental_start_date.
        Also ensures rental_start_date is in the future.
        """
        rental_start_date = data.get('rental_start_date')
        rental_end_date = data.get('rental_end_date')

        if rental_start_date and rental_end_date:
            if rental_end_date < rental_start_date:
                raise serializers.ValidationError("Rental end date cannot be before start date.")

        return data

    def validate_pincode(self, value):
        """
        Ensure the pincode is a valid integer and is of correct length (typically 6 digits in India).
        """
        if not str(value).isdigit() or len(str(value)) != 6:
            raise serializers.ValidationError("Pincode must be a 6-digit number.")
        return value
