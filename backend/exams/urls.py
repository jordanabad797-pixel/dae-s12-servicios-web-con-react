from rest_framework.routers import DefaultRouter

from .views import ExamViewSet

# DefaultRouter keeps the trailing slash (/exams/ and /exams/<id>/), the same contract as the simulated API.
router = DefaultRouter()
router.register("exams", ExamViewSet, basename="exam")

urlpatterns = router.urls
