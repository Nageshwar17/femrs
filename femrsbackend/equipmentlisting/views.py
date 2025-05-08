from django.shortcuts import render

'''
# Create your views here.
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Equipment
from .serializers import EquipmentSerializer

# ✅ Add Equipment
class AddEquipmentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = EquipmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)  # Assign logged-in user
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ✅ Get Equipment List (Only for Logged-in User)
class EquipmentListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        equipment_items = Equipment.objects.filter(user=request.user)  # Filter by logged-in user
        serializer = EquipmentSerializer(equipment_items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ✅ Update Equipment (Only if Owned by User)
class UpdateEquipmentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, equipment_id):
        equipment = get_object_or_404(Equipment, id=equipment_id, user=request.user)
        serializer = EquipmentSerializer(equipment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ✅ Delete Equipment (Only if Owned by User)
class DeleteEquipmentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, equipment_id):
        equipment = get_object_or_404(Equipment, id=equipment_id, user=request.user)
        equipment.delete()
        return Response({"message": "Equipment deleted successfully!"}, status=status.HTTP_204_NO_CONTENT)
'''

from rest_framework import viewsets, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Equipment
from .serializers import EquipmentSerializer

class EquipmentViewSet(viewsets.ModelViewSet):
    serializer_class = EquipmentSerializer
    permission_classes = [permissions.AllowAny]  # ✅ Allow access without login

    def get_queryset(self):
        return Equipment.objects.all()  # ✅ Show all equipment

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)  # Associate equipment with the user

    def destroy(self, request, *args, **kwargs):
        instance = get_object_or_404(Equipment, id=kwargs['pk'], user=request.user)
        self.perform_destroy(instance)
        return Response({"message": "Equipment deleted successfully!"})
