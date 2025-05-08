from django.shortcuts import get_object_or_404
from rest_framework import viewsets

from rest_framework.permissions import IsAuthenticated

from rest_framework.exceptions import ValidationError
from .models import Booking, IdGeneration
from equipmentlisting.models import Equipment
from .serializers import BookingSerializer
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
import logging

logger = logging.getLogger(__name__)



class BookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling Booking operations.
    """
    
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]  # Ensure only authenticated users can book

    def get_queryset(self):
        user = self.request.user

        # If the user is a farmer, return only their own bookings
        if user.profile.user_type == "farmer":  # Adjust based on your custom user model
            return Booking.objects.filter(user=user)

        # If the user is an equipment owner, return all bookings for their equipment
        elif user.profile.user_type == "owner":
            return Booking.objects.filter(equipment_owner=user)

        return Booking.objects.none()  # Default empty queryset

    def perform_create(self, serializer):
        """
        Custom create method to:
        - Generate booking number
        - Calculate total cost
        - Associate user with the booking
        """
        equipment_id = self.request.data.get('equipment')
        shipping_address = self.request.data.get('shipping_address')
        pincode = self.request.data.get('pincode')
        rental_start_date = serializer.validated_data.get('rental_start_date')
        rental_end_date = serializer.validated_data.get('rental_end_date')


        # Validate required fields
        if not equipment_id or not shipping_address or not pincode:
            raise ValidationError({"error": "Missing required fields."})
        
        equipment = get_object_or_404(Equipment, id=equipment_id)

        if rental_end_date < rental_start_date:
            raise ValidationError({"error": "Rental end date cannot be before start date."})
        
        # Ensure ID generation instance exists
        id_generation, created = IdGeneration.objects.get_or_create(defaults={"counter": 1})

        # Calculate booking details
        total_days = (rental_end_date - rental_start_date).days + 1
        amount_payable = equipment.price_per_day * total_days  # Ensure 'price' is correct

        # Generate booking number
        booking_no = str(equipment.id) + id_generation.generate_id()
        
        # Save booking without returning a Response
        serializer.save(
            user=self.request.user,
            equipment=equipment,
            equipment_owner=equipment.user,
            shipping_address=shipping_address,
            pincode=pincode,
            rental_start_date=rental_start_date,
            rental_end_date=rental_end_date,
            total_days=total_days,
            amount_payable=amount_payable,
            booking_no=booking_no
        )
        
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        equipment = instance.equipment
    
        # Make equipment available again
        equipment.available = True
        equipment.save()
    
        # Identify who is cancelling
        cancelled_by = request.user
        is_farmer = cancelled_by == instance.user
        is_owner = cancelled_by == equipment.user
    
        subject = "Booking Cancelled Notification"
        farmer_email = instance.user.email
        owner_email = equipment.user.email
    
        try:
            # Email to Farmer
            farmer_message = render_to_string("emails/farmer_booking_cancelled.html", {
                "first_name": instance.user.first_name,
                "equipment_name": equipment.equipment_name,
                "booking_id": instance.id,
                "rental_start": instance.rental_start_date,
                "rental_end": instance.rental_end_date,
                "cancelled_by": "You" if is_farmer else f"{equipment.user.get_full_name()} (Owner)",
            })
    
            send_mail(
                subject,
                "",
                settings.EMAIL_HOST_USER,
                [farmer_email],
                fail_silently=False,
                html_message=farmer_message,
            )
    
            # Email to Owner
            owner_message = render_to_string("emails/owner_booking_cancelled.html", {
                "owner_name": equipment.user.first_name,
                "equipment_name": equipment.equipment_name,
                "booking_id": instance.id,
                "farmer_name": instance.user.get_full_name(),
                "cancelled_by": "You" if is_owner else f"{instance.user.get_full_name()} (Farmer)",
            })
    
            send_mail(
                subject,
                "",
                settings.EMAIL_HOST_USER,
                [owner_email],
                fail_silently=False,
                html_message=owner_message,
            )
    
        except Exception as e:
            logger.error(f"Cancellation email sending failed: {str(e)}")
    
        return super().destroy(request, *args, **kwargs)
    
        
   