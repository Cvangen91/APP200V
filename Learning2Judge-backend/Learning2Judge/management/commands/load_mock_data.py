import os
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

        # Mock categories data
        categories_data = [
            {'CategoryId': 1, 'CategoryName': 'Basic Movements', 'Description': 'Fundamental movements and techniques'},
            {'CategoryId': 2, 'CategoryName': 'Advanced Techniques', 'Description': 'Complex movements for experienced practitioners'},
            {'CategoryId': 3, 'CategoryName': 'Special Skills', 'Description': 'Specialized techniques and unique movements'}
        ]

        for row in categories_data:
            Category.objects.get_or_create(
                category_id=row['CategoryId'],
                defaults={
                    'name': row['CategoryName'],
                    'description': row['Description']
                }
            )

        # Mock programs data
        programs_data = [
            {'ProgramId': 1, 'ProgramName': 'LB3', 'Description': 'Fundamental training program', 'EquipageId': 1, 'VideoPath': 'https://www.youtube.com/watch?v=qXQcxVEMtiw&t=1s'},
            {'ProgramId': 2, 'ProgramName': 'LA3', 'Description': 'Advanced training program', 'EquipageId': 2, 'VideoPath': 'https://www.youtube.com/watch?v=Oc_FQV7Wc_E&t=59s'},
            {'ProgramId': 3, 'ProgramName': 'MB1', 'Description': 'Special training program', 'EquipageId': 3, 'VideoPath': 'https://www.youtube.com/watch?v=9liTn3hAjrA'}
        ]

        for row in programs_data:
            try:
                equipage_id = row['EquipageId'] if row['EquipageId'] else None
                Program.objects.get_or_create(
                    program_id=row['ProgramId'],
                    defaults={
                        'name': row['ProgramName'],
                        'description': row['Description'],
                        'equipage_id': equipage_id,
                        'video_path': row['VideoPath']
                    }
                )
            except (ValueError, KeyError) as e:
                self.stdout.write(self.style.ERROR(f"Error creating program: {str(e)}"))

        # Mock exercises data
        exercises_data = [
            {'ExerciseId': 1, 'ExerciseName': 'Basic Movement 1', 'CategoryId': 1, 'Description': 'First basic movement', 'VideoUrl': '/videos/basic1.mp4'},
            {'ExerciseId': 2, 'ExerciseName': 'Basic Movement 2', 'CategoryId': 1, 'Description': 'Second basic movement', 'VideoUrl': '/videos/basic2.mp4'},
            {'ExerciseId': 3, 'ExerciseName': 'Advanced Technique 1', 'CategoryId': 2, 'Description': 'First advanced technique', 'VideoUrl': '/videos/advanced1.mp4'},
            {'ExerciseId': 4, 'ExerciseName': 'Advanced Technique 2', 'CategoryId': 2, 'Description': 'Second advanced technique', 'VideoUrl': '/videos/advanced2.mp4'},
            {'ExerciseId': 5, 'ExerciseName': 'Special Skill 1', 'CategoryId': 3, 'Description': 'First special skill', 'VideoUrl': '/videos/special1.mp4'},
            {'ExerciseId': 6, 'ExerciseName': 'Special Skill 2', 'CategoryId': 3, 'Description': 'Second special skill', 'VideoUrl': '/videos/special2.mp4'}
        ]

        for row in exercises_data:
            try:
                exercise_id = row['ExerciseId']
                category_id = row['CategoryId']
                
                if not Category.objects.filter(category_id=category_id).exists():
                    category_id = default_category.category_id
                
                Exercise.objects.get_or_create(
                    exercise_id=exercise_id,
                    defaults={
                        'name': row['ExerciseName'],
                        'category_id': category_id,
                        'description': row['Description'],
                        'video_url': row['VideoUrl']
                    }
                )
            except (ValueError, KeyError) as e:
                self.stdout.write(self.style.ERROR(f"Error creating exercise: {str(e)}"))

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
