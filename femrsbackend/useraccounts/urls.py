from django.urls import path
from .views import RegisterView, LoginView, LogoutView, ProfileView, create_admin

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('create-admin/', create_admin, name='create_admin'),
]
