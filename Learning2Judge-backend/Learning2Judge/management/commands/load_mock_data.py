import os
from django.core.management.base import BaseCommand
from Learning2Judge.models import Category, Program, Exercise, CorrectScore
from decimal import Decimal

class Command(BaseCommand):
    help = 'Loads initial mock data for development'

    def handle(self, *args, **options):
        # Create default category
        default_category, created = Category.objects.get_or_create(
            category_id="999",
            defaults={'name': 'Unknown Category'}
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('Created default category'))
        else:
            self.stdout.write(self.style.SUCCESS('Using existing default category'))

        # Mock categories data
        categories_data = [
            {'CategoryId': '1', 'CategoryName': 'Basic Movements'},
            {'CategoryId': '2', 'CategoryName': 'Advanced Techniques'},
            {'CategoryId': '3', 'CategoryName': 'Special Skills'}
        ]

        for row in categories_data:
            Category.objects.get_or_create(
                category_id=str(row['CategoryId']),
                defaults={'name': row['CategoryName']}
            )

        # Mock programs data
        programs_data = [
            {'ProgramId': '1', 'ProgramName': 'Basic Training', 'EquipageId': '1', 'VideoPath': '/videos/basic.mp4'},
            {'ProgramId': '2', 'ProgramName': 'Advanced Training', 'EquipageId': '2', 'VideoPath': '/videos/advanced.mp4'},
            {'ProgramId': '3', 'ProgramName': 'Special Training', 'EquipageId': '3', 'VideoPath': '/videos/special.mp4'}
        ]

        for row in programs_data:
            try:
                equipage_id = int(row['EquipageId']) if row['EquipageId'] and row['EquipageId'].isdigit() else None
                Program.objects.get_or_create(
                    program_id=int(row['ProgramId']),
                    defaults={
                        'name': row['ProgramName'],
                        'equipage_id': equipage_id,
                        'video_path': row['VideoPath']
                    }
                )
            except (ValueError, KeyError) as e:
                self.stdout.write(self.style.ERROR(f"Error creating program: {str(e)}"))

        # Mock exercises data
        exercises_data = [
            {'ExerciseId': '1', 'ExerciseName': 'Basic Movement 1', 'CategoryId': '1'},
            {'ExerciseId': '2', 'ExerciseName': 'Basic Movement 2', 'CategoryId': '1'},
            {'ExerciseId': '3', 'ExerciseName': 'Advanced Technique 1', 'CategoryId': '2'},
            {'ExerciseId': '4', 'ExerciseName': 'Advanced Technique 2', 'CategoryId': '2'},
            {'ExerciseId': '5', 'ExerciseName': 'Special Skill 1', 'CategoryId': '3'},
            {'ExerciseId': '6', 'ExerciseName': 'Special Skill 2', 'CategoryId': '3'}
        ]

        for row in exercises_data:
            try:
                exercise_id = int(row['ExerciseId'])
                category_id = str(row['CategoryId'])
                
                if not Category.objects.filter(category_id=category_id).exists():
                    category_id = default_category.category_id
                
                Exercise.objects.get_or_create(
                    exercise_id=exercise_id,
                    defaults={
                        'name': row['ExerciseName'],
                        'category_id': category_id
                    }
                )
            except (ValueError, KeyError) as e:
                self.stdout.write(self.style.ERROR(f"Error creating exercise: {str(e)}"))

        # Mock correct scores data
        scores_data = [
            {'Id': '1', 'ProgramId': '1', 'ExerciseId': '1', 'ExecutionNumber': '1', 'CorrectScore': '10.0'},
            {'Id': '2', 'ProgramId': '1', 'ExerciseId': '2', 'ExecutionNumber': '1', 'CorrectScore': '15.0'},
            {'Id': '3', 'ProgramId': '2', 'ExerciseId': '3', 'ExecutionNumber': '1', 'CorrectScore': '20.0'},
            {'Id': '4', 'ProgramId': '2', 'ExerciseId': '4', 'ExecutionNumber': '1', 'CorrectScore': '25.0'},
            {'Id': '5', 'ProgramId': '3', 'ExerciseId': '5', 'ExecutionNumber': '1', 'CorrectScore': '30.0'},
            {'Id': '6', 'ProgramId': '3', 'ExerciseId': '6', 'ExecutionNumber': '1', 'CorrectScore': '35.0'}
        ]

        for row in scores_data:
            try:
                correct_score_id = int(row['Id'])
                program_id = int(row['ProgramId'])
                exercise_id = int(row['ExerciseId'])
                
                if not Exercise.objects.filter(exercise_id=exercise_id).exists():
                    continue
                
                if not Program.objects.filter(program_id=program_id).exists():
                    continue
                
                CorrectScore.objects.get_or_create(
                    correct_score_id=correct_score_id,
                    defaults={
                        'program_id': program_id,
                        'execution_number': int(row['ExecutionNumber']),
                        'exercise_id': exercise_id,
                        'correct_score': Decimal(row['CorrectScore'])
                    }
                )
            except (ValueError, KeyError) as e:
                self.stdout.write(self.style.ERROR(f"Error creating correct score: {str(e)}"))

        self.stdout.write(self.style.SUCCESS('Mock data loaded successfully.'))
