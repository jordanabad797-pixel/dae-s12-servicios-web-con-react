from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import Exam

PROJECT_ORIGIN = "http://localhost:5173"


class ExamApiTests(TestCase):
    """The same contract the React client is tested against with the simulated network."""

    def setUp(self):
        self.client = APIClient()
        self.exam = Exam.objects.create(title="API REST con DRF", question_count=5)

    def test_list_returns_an_array_with_the_contract_fields(self):
        response = self.client.get("/api/exams/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(set(response.json()[0]), {"id", "title", "created_at", "question_count"})

    def test_create_returns_201_with_the_new_exam(self):
        response = self.client.post("/api/exams/", {"title": "  Examen final  "}, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["title"], "Examen final")
        self.assertEqual(Exam.objects.count(), 2)

    def test_blank_title_returns_400_with_the_field_message(self):
        response = self.client.post("/api/exams/", {"title": ""}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("title", response.json())
        self.assertIn("en blanco", response.json()["title"][0])

    def test_delete_returns_204_and_then_404(self):
        self.assertEqual(self.client.delete(f"/api/exams/{self.exam.id}/").status_code, 204)
        self.assertEqual(self.client.delete(f"/api/exams/{self.exam.id}/").status_code, 404)

    def test_update_is_not_exposed(self):
        response = self.client.put(f"/api/exams/{self.exam.id}/", {"title": "x"}, format="json")
        self.assertEqual(response.status_code, 405)


class CorsTests(TestCase):
    """CORS_ALLOWED_ORIGINS: only the exact origin of the React app."""

    def preflight(self, origin):
        return self.client.options(
            "/api/exams/",
            HTTP_ORIGIN=origin,
            HTTP_ACCESS_CONTROL_REQUEST_METHOD="DELETE",
        )

    def test_project_origin_is_allowed(self):
        response = self.preflight(PROJECT_ORIGIN)
        self.assertEqual(response.headers.get("access-control-allow-origin"), PROJECT_ORIGIN)

    def test_foreign_origin_is_rejected(self):
        self.assertNotIn("access-control-allow-origin", self.preflight("https://sitio-malo.example").headers)

    def test_other_port_is_another_origin(self):
        self.assertNotIn("access-control-allow-origin", self.preflight("http://localhost:3000").headers)

    def test_no_wildcard(self):
        response = self.preflight("https://sitio-malo.example")
        self.assertNotEqual(response.headers.get("access-control-allow-origin"), "*")

    @override_settings(CORS_ALLOW_ALL_ORIGINS=True)
    def test_wildcard_would_accept_anyone(self):
        """Documents why the wildcard is a bug: a foreign site gets '*'."""
        self.assertEqual(self.preflight("https://sitio-malo.example").headers.get("access-control-allow-origin"), "*")
