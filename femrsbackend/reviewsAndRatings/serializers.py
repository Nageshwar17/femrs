from decimal import Decimal
from rest_framework import serializers
from .models import Review
from bookings.models import Booking

class ReviewSerializer(serializers.ModelSerializer):
    equipment_name = serializers.ReadOnlyField(source='equipment.name')
    user_name = serializers.ReadOnlyField(source='user.username')
    rating = serializers.DecimalField(max_digits=2, decimal_places=1)

    class Meta:
        model = Review
        fields = ['id', 'equipment', 'equipment_name', 'user', 'user_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['equipment_name', 'user_name', 'created_at']

    def validate_rating(self, value):
        if value < Decimal('1') or value > Decimal('5'):
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def validate(self, data):
        request = self.context['request']
        user = request.user
        equipment = data.get('equipment') or getattr(self.instance, 'equipment', None)

        if request.method == 'POST':
            # Only farmers who have booked the equipment can review
            if not Booking.objects.filter(user=user, equipment=equipment).exists():
                raise serializers.ValidationError("You can only review equipment after a successful booking.")

            # Only one review per equipment per user
            if Review.objects.filter(user=user, equipment=equipment).exists():
                raise serializers.ValidationError("You have already reviewed this equipment.")

        elif request.method in ['PUT', 'PATCH']:
            # Skip uniqueness check for the current review instance
            if Review.objects.filter(user=user, equipment=equipment).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("You have already reviewed this equipment.")

        return data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
