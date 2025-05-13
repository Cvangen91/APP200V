import os
import csv
from django.core.management.base import BaseCommand
from Learning2Judge.models import Category, Program, Exercise, ProgramScore
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

        # Mock programs data
        programs_data = [
            {'ProgramId': 1, 'ProgramName': 'LB3', 'Description': 'Fundamental training program', 'EquipageId': 1, 'VideoPath': 'https://www.youtube.com/watch?v=qXQcxVEMtiw&t=1s', 'Exercises': [9,1,12,1,8,12,25,23,13,36,25]},
            {'ProgramId': 2, 'ProgramName': 'LA3', 'Description': 'Advanced training program', 'EquipageId': 2, 'VideoPath': 'https://www.youtube.com/watch?v=Oc_FQV7Wc_E&t=59s', 'Exercises': [3,4,5,6,7,8,9,10]},
            {'ProgramId': 3, 'ProgramName': 'MB1', 'Description': 'Special training program', 'EquipageId': 3, 'VideoPath': 'https://www.youtube.com/watch?v=9liTn3hAjrA', 'Exercises': [5,6,1,2,3,4,7,8]}
        ]

        for row in programs_data:
            try:
                equipage_id = row['EquipageId'] if row['EquipageId'] else None
                program, created = Program.objects.get_or_create(
                    program_id=row['ProgramId'],
                    defaults={
                        'name': row['ProgramName'],
                        'equipage_id': equipage_id,
                        'video_path': row['VideoPath']
                    }
                )
                
                # Adiciona os exercícios ao programa
                if 'Exercises' in row and row['Exercises']:
                    # Se for uma string, converte para lista de inteiros
                    if isinstance(row['Exercises'], str):
                        exercise_ids = [int(x.strip()) for x in row['Exercises'].split(',')]
                    else:
                        exercise_ids = row['Exercises']
                    
                    # Salva a ordem dos exercícios
                    program.exercise_order = ','.join(map(str, exercise_ids))
                    program.save()
                    
                    exercises = Exercise.objects.filter(exercise_id__in=exercise_ids)
                    program.exercises.set(exercises)
                
            except (ValueError, KeyError) as e:
                self.stdout.write(self.style.ERROR(f"Error creating program: {str(e)}"))

        # Mock program scores data
        scores_data = [
            {'Id': 1, 'ProgramId': 1, 'ExerciseId': 1, 'Score': '10.0'},
            {'Id': 2, 'ProgramId': 1, 'ExerciseId': 2, 'Score': '15.0'},
            {'Id': 3, 'ProgramId': 2, 'ExerciseId': 3, 'Score': '20.0'},
            {'Id': 4, 'ProgramId': 2, 'ExerciseId': 4, 'Score': '25.0'},
            {'Id': 5, 'ProgramId': 3, 'ExerciseId': 5, 'Score': '30.0'},
            {'Id': 6, 'ProgramId': 3, 'ExerciseId': 6, 'Score': '35.0'}
        ]

        for row in scores_data:
            try:
                program_score_id = row['Id']
                program_id = row['ProgramId']
                exercise_id = row['ExerciseId']
                
                if not Exercise.objects.filter(exercise_id=exercise_id).exists():
                    continue
                
                if not Program.objects.filter(program_id=program_id).exists():
                    continue
                
                ProgramScore.objects.get_or_create(
                    program_score_id=program_score_id,
                    defaults={
                        'program_id': program_id,
                        'exercise_id': exercise_id,
                        'score': float(row['Score'])
                    }
                )
            except (ValueError, KeyError) as e:
                self.stdout.write(self.style.ERROR(f"Error creating program score: {str(e)}"))

        self.stdout.write(self.style.SUCCESS('Mock data loaded successfully.'))
