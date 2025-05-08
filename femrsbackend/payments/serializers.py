from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    booking_id = serializers.ReadOnlyField(source='booking.id')  # Display Booking ID in API

    class Meta:
        model = Payment
        fields = ['id', 'booking_id', 'payment_id', 'order_id', 'status', 'amount', 'created_at']
        read_only_fields = ['id', 'created_at']  # Prevent modification of these fields
