from django.db import models


class Exam(models.Model):
    """A quiz of the course. `question_count` is stored to keep the contract of the week 8 API."""

    title = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    question_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["id"]
        verbose_name = "exam"
        verbose_name_plural = "exams"

    def __str__(self):
        return self.title
