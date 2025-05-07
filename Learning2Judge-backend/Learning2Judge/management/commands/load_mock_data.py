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

        # Mock exercises data
        exercises_data = [
            {'ExerciseId': 1, 'ExerciseName': 'Basic Movement 1', 'CategoryId': 1, 'Description': 'First basic movement', 'VideoUrl': '/videos/basic1.mp4'},
            {'ExerciseId': 2, 'ExerciseName': 'Basic Movement 2', 'CategoryId': 1, 'Description': 'Second basic movement', 'VideoUrl': '/videos/basic2.mp4'},
            {'ExerciseId': 3, 'ExerciseName': 'Advanced Technique 1', 'CategoryId': 2, 'Description': 'First advanced technique', 'VideoUrl': '/videos/advanced1.mp4'},
            {'ExerciseId': 4, 'ExerciseName': 'Advanced Technique 2', 'CategoryId': 2, 'Description': 'Second advanced technique', 'VideoUrl': '/videos/advanced2.mp4'},
            {'ExerciseId': 5, 'ExerciseName': 'Special Skill 1', 'CategoryId': 3, 'Description': 'First special skill', 'VideoUrl': '/videos/special1.mp4'},
            {'ExerciseId': 6, 'ExerciseName': 'Special Skill 2', 'CategoryId': 3, 'Description': 'Second special skill', 'VideoUrl': '/videos/special2.mp4'},
            {'ExerciseId': 7, 'ExerciseName': 'Special Skill 3', 'CategoryId': 3, 'Description': 'Third special skill', 'VideoUrl': '/videos/special3.mp4'},
            {'ExerciseId': 8, 'ExerciseName': 'Special Skill 4', 'CategoryId': 3, 'Description': 'Fourth special skill', 'VideoUrl': '/videos/special4.mp4'},
            {'ExerciseId': 9, 'ExerciseName': 'Special Skill 5', 'CategoryId': 3, 'Description': 'Fifth special skill', 'VideoUrl': '/videos/special5.mp4'},
            {'ExerciseId': 10, 'ExerciseName': 'Special Skill 6', 'CategoryId': 3, 'Description': 'Sixth special skill', 'VideoUrl': '/videos/special6.mp4'},
            {'ExerciseId': 12, 'ExerciseName': 'Special Skill 7', 'CategoryId': 3, 'Description': 'Seventh special skill', 'VideoUrl': '/videos/special7.mp4'},
            {'ExerciseId': 13, 'ExerciseName': 'Special Skill 8', 'CategoryId': 3, 'Description': 'Eighth special skill', 'VideoUrl': '/videos/special8.mp4'},
            {'ExerciseId': 23, 'ExerciseName': 'Special Skill 9', 'CategoryId': 3, 'Description': 'Ninth special skill', 'VideoUrl': '/videos/special9.mp4'},
            {'ExerciseId': 25, 'ExerciseName': 'Special Skill 10', 'CategoryId': 3, 'Description': 'Tenth special skill', 'VideoUrl': '/videos/special10.mp4'},
            {'ExerciseId': 36, 'ExerciseName': 'Special Skill 11', 'CategoryId': 3, 'Description': 'Eleventh special skill', 'VideoUrl': '/videos/special11.mp4'}
        ]

        for row in exercises_data:
            try:
                exercise_id = row['ExerciseId']
                category_id = row['CategoryId']
                
                if not Category.objects.filter(category_id=category_id).exists():
                    category_id = default_category.category_id
                
                exercise, created = Exercise.objects.get_or_create(
                    exercise_id=exercise_id,
                    defaults={
                        'name': row['ExerciseName'],
                        'category_id': category_id,
                        'description': row['Description'],
                        'video_url': row['VideoUrl']
                    }
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f'Created exercise: {exercise.name}'))
            except (ValueError, KeyError) as e:
                self.stdout.write(self.style.ERROR(f"Error creating exercise: {str(e)}"))

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
                        'description': row['Description'],
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
