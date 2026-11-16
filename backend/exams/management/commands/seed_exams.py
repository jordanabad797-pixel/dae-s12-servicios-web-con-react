from django.core.management.base import BaseCommand

from exams.models import Exam

SEED = [
    ("Django · Modelos y migraciones", 6),
    ("Django · Plantillas", 4),
    ("Django · ORM y consultas", 8),
    ("API REST con DRF", 5),
    ("React · Componentes y eventos", 7),
    ("React · Hooks", 3),
]


class Command(BaseCommand):
    help = "Loads the six exams of the lab (the same data as the simulated API). Idempotent."

    def handle(self, *args, **options):
        created = 0
        for title, question_count in SEED:
            _, was_created = Exam.objects.get_or_create(title=title, defaults={"question_count": question_count})
            created += int(was_created)
        self.stdout.write(self.style.SUCCESS(f"{created} exams created, {Exam.objects.count()} in total."))
