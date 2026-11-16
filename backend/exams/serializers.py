from rest_framework import serializers

from .models import Exam


class ExamSerializer(serializers.ModelSerializer):
    """The JSON contract the React client and examctl consume: { id, title, created_at, question_count }."""

    class Meta:
        model = Exam
        fields = ["id", "title", "created_at", "question_count"]
        read_only_fields = ["id", "created_at", "question_count"]

    def validate_title(self, value):
        # CharField already rejects "" with "Este campo no puede estar en blanco."; trim the rest.
        return value.strip()
