from rest_framework import mixins, viewsets

from .models import Exam
from .serializers import ExamSerializer


class ExamViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """
    GET    /api/exams/        -> 200 [ ... ]
    POST   /api/exams/        -> 201 { ... }  |  400 { "title": ["..."] }
    DELETE /api/exams/<id>/   -> 204          |  404 { "detail": "..." }

    Only the three operations the screen uses are exposed (no update, no retrieve): least privilege.
    """

    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
