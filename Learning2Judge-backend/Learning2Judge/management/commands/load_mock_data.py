import os
import csv
from django.core.management.base import BaseCommand
from Learning2Judge.models import Category, Program, Exercise
from decimal import Decimal

class Command(BaseCommand):
    help = 'Loads initial mock data for development'

    def handle(self, *args, **options):
        # Create default category
        default_category, created = Category.objects.get_or_create(
            category_id=999,
            defaults={
                'name': 'Unknown Category',
                'description': 'Default category for unclassified exercises'
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('Created default category'))
        else:
            self.stdout.write(self.style.SUCCESS('Using existing default category'))

        # Load exercises from CSV
        csv_path = os.path.join('data', 'Database-Schemas(Exercise).csv')
        try:
            with open(csv_path, 'r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    try:
                        exercise_id = int(row['ExerciseId'])
                        category_id = int(row['CategoryId'])
                        
                        if not Category.objects.filter(category_id=category_id).exists():
                            category_id = default_category.category_id
                        
                        exercise, created = Exercise.objects.get_or_create(
                            exercise_id=exercise_id,
                            defaults={
                                'name': row['ExerciseName'],
                                'category_id': category_id
                            }
                        )
                        if created:
                            self.stdout.write(self.style.SUCCESS(f'Created exercise: {exercise.name}'))
                    except (ValueError, KeyError) as e:
                        self.stdout.write(self.style.ERROR(f"Error creating exercise: {str(e)}"))
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f"CSV file not found at {csv_path}"))
            return

        # Load programs from CSV
        programs_csv_path = os.path.join('data', 'Database-Schemas(Program).csv')
        try:
            with open(programs_csv_path, 'r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    try:
                        # Criar ou atualizar o programa
                        program, created = Program.objects.update_or_create(
                            name=row['Name'],
                            defaults={
                                'equipage_id': row['EquipageId'],
                                'video_path': row['VideoPath'],
                                'exercise_order': row['Exercises']
                            }
                        )
                        
                        if created:
                            self.stdout.write(self.style.SUCCESS(f'Created program: {program.name}'))
                        else:
                            self.stdout.write(self.style.SUCCESS(f'Updated program: {program.name}'))
                    except (ValueError, KeyError) as e:
                        self.stdout.write(self.style.ERROR(f"Error creating program: {str(e)}"))
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f"Programs CSV file not found at {programs_csv_path}"))
            return

        self.stdout.write(self.style.SUCCESS('Mock data loaded successfully.'))
