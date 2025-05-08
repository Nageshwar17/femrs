"""from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet, InitiatePaymentView, VerifyPaymentView, PaymentSuccessView

router = DefaultRouter()
router.register(r'payments', PaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
    path('initiate-payment/<int:equipment_id>/<int:booking_id>/', InitiatePaymentView.as_view(), name='initiate-payment'),
    path('verify-payment/', VerifyPaymentView.as_view(), name='verify_payment'),
    path('payment-success/', PaymentSuccessView.as_view(), name='payment_success'),
]
"""
from django.urls import path
from .views import InitiatePaymentView, VerifyPaymentView, PaymentSuccessView

urlpatterns = [
    path('initiate-payment/<int:equipment_id>/<int:booking_id>/', InitiatePaymentView.as_view(), name='initiate-payment'),
    path('verify-payment/', VerifyPaymentView.as_view(), name='verify-payment'),
    path('payment-success/', PaymentSuccessView.as_view(), name='payment-success'),
]
