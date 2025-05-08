from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework import serializers

from bookings.models import Booking
from .models import Review
from .serializers import ReviewSerializer

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        equipment_id = self.request.query_params.get('equipment_id')
        if equipment_id:
            return Review.objects.filter(equipment_id=equipment_id)
        return Review.objects.all()

    def perform_create(self, serializer):
        user = self.request.user
        equipment = serializer.validated_data['equipment']
        
        # Ensure the user can only review equipment they've booked
        if not Booking.objects.filter(user=user, equipment=equipment).exists():
            raise serializers.ValidationError("You can only review equipment after a successful booking.")
        
        # Check if the user already reviewed this equipment
        if Review.objects.filter(user=user, equipment=equipment).exists():
            raise serializers.ValidationError("You have already reviewed this equipment.")
        
        # If no review exists, create the new review
        serializer.save(user=user)

    def perform_update(self, serializer):
        review = self.get_object()

        # Only allow updates if the current user is the author of the review
        if self.request.user == review.user:
            serializer.save()
            return Response(serializer.data)
        else:
            raise PermissionDenied("You can only update your own review.")

    def perform_destroy(self, instance):
        if self.request.user == instance.user:
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            raise PermissionDenied("You can only delete your own review.")
