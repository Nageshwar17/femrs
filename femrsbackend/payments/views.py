from django.shortcuts import render, get_object_or_404
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
import razorpay
from django.core.mail import send_mail
from django.template.loader import render_to_string
import logging

from .models import Payment
from .serializers import PaymentSerializer
from bookings.models import Booking
from equipmentlisting.models import Equipment

logger = logging.getLogger(__name__)

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()

class InitiatePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, equipment_id, booking_id):

        print(f"Received equipment_id: {equipment_id}")  # Debugging
        print(f"Received booking_id: {booking_id}")  # Debugging
        booking = get_object_or_404(Booking, id=booking_id)

        # Ensure equipment in booking matches the equipment_id passed
       
        try:
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY, settings.RAZORPAY_SECRET))
            payment_data = {
                "amount": int(booking.amount_payable * 100),
                "currency": "INR",
                "payment_capture": 1,
            }
            order = client.order.create(payment_data)
        except razorpay.errors.BadRequestError as e:
            logger.error(f"Razorpay Error: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        payment_obj = Payment.objects.create(
            booking=booking,
            amount=booking.amount_payable,
            order_id=order['id'],
            status="Pending",
        )
        
        return Response(
            {
                "message": "Payment initiated successfully",
                "order_id": payment_obj.order_id,
                "amount": payment_obj.amount,
            },
            status=status.HTTP_201_CREATED
        )

class VerifyPaymentView(APIView):
    def post(self, request):
        order_id = request.data.get("razorpay_order_id")
        payment_id = request.data.get("razorpay_payment_id")
        signature = request.data.get("razorpay_signature")
        print(f"Received order_id: {order_id}, payment_id: {payment_id}")

        payment = get_object_or_404(Payment, order_id=order_id, status="Pending")

        try:
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY, settings.RAZORPAY_SECRET))
            client.utility.verify_payment_signature({
                "razorpay_order_id": order_id,
                "razorpay_payment_id": payment_id,
                "razorpay_signature": signature,
            })
        except razorpay.errors.SignatureVerificationError:
            return Response({"error": "Payment verification failed"}, status=status.HTTP_400_BAD_REQUEST)
        
        payment.payment_id = payment_id
        payment.status = "Successful"
        payment.save()

        # Mark equipment as unavailable after successful payment
        equipment = payment.booking.equipment
        equipment.available = False
        equipment.save()

        return Response({"message": "Payment verified successfully"}, status=status.HTTP_200_OK)

class PaymentSuccessView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("razorpay_order_id")
        payment = get_object_or_404(Payment, order_id=order_id, status="Successful")
        booking = payment.booking
        
        farmer_email = booking.user.email
        owner_email = booking.equipment.user.email

        subject = "Booking Confirmation"

        try:
            farmer_message = render_to_string("emails/farmer_booking_confirmation.html", {
                "first_name": booking.user.first_name,
                "equipment_name": booking.equipment.equipment_name,
                "booking_id": booking.id,
                "order_id": payment.order_id,
                "payment_id": payment.payment_id,
                "amount": booking.amount_payable,
            })

            send_mail(
                subject,
                "",
                settings.EMAIL_HOST_USER,
                [farmer_email],
                fail_silently=False,
                html_message=farmer_message,
            )

            owner_message = render_to_string("emails/owner_booking_notification.html", {
                "owner_name": booking.equipment.user.first_name,
                "equipment_name": booking.equipment.equipment_name,
                "booking_id": booking.id,
                "order_id": payment.order_id,
                "farmer_name": booking.user.get_full_name(),
                "shipping_address": booking.shipping_address,
                "pincode": booking.pincode,
                "rental_start": booking.rental_start_date,
                "rental_end": booking.rental_end_date,
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
            logger.error(f"Email sending failed: {str(e)}")
            return Response({"error": "Payment successful, but email sending failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"message": "Payment successful and emails sent"}, status=status.HTTP_200_OK)
