
from rest_framework import serializers

from useraccounts.serializers import UserSerializer
from .models import Equipment

class EquipmentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Equipment
        fields = '__all__'  # Includes all fields
        read_only_fields = ['user', 'date_added']  # Auto-assigned fields
