from rest_framework import serializers
from .models import Program

class ProgramSerializer(serializers.ModelSerializer):
    program_id = serializers.CharField()  # Ensure this is serialized as a string
    equipage_id = serializers.CharField(allow_null=True)  # Ensure this is serialized as a string

    class Meta:
        model = Program
        fields = ['program_id', 'name', 'description', 'equipage_id']
