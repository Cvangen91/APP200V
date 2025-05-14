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

        # Load program scores from CSV
        scores_csv_path = os.path.join('data', 'Database-Schemas(ProgramScore).csv')
        try:
            with open(scores_csv_path, 'r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    try:
                        program_id = int(row['ProgramId'])
                        program = Program.objects.get(program_id=program_id)
                        
                        # Limpa os scores existentes para este programa
                        ProgramScore.objects.filter(program=program).delete()
                        
                        # Obtém a lista de exercícios do programa
                        exercise_ids = [int(x.strip()) for x in program.exercise_order.split(',')]
                        
                        # Obtém a lista de scores corretos
                        correct_scores = [float(x.strip()) for x in row['CorrectScores'].strip('"').split(',')]
                        
                        # Se o número de scores for diferente do número de exercícios, ajusta para usar o máximo possível
                        if len(exercise_ids) != len(correct_scores):
                            self.stdout.write(self.style.WARNING(
                                f"Aviso: Número de scores ({len(correct_scores)}) não corresponde ao número de exercícios ({len(exercise_ids)}) para o programa {program.name}. Usando o máximo possível."
                            ))
                            
                            # Use o menor número entre exercícios e scores
                            max_index = min(len(exercise_ids), len(correct_scores))
                            exercise_ids = exercise_ids[:max_index]
                            correct_scores = correct_scores[:max_index]
                        
                        # Cria um ProgramScore para cada exercício
                        for i, exercise_id in enumerate(exercise_ids):
                            try:
                                exercise = Exercise.objects.get(exercise_id=exercise_id)
                                ProgramScore.objects.create(
                                    program=program,
                                    exercise=exercise,
                                    score=correct_scores[i]
                                )
                            except Exercise.DoesNotExist:
                                self.stdout.write(self.style.ERROR(f"Exercício {exercise_id} não encontrado"))
                            except Exception as e:
                                self.stdout.write(self.style.ERROR(f"Erro ao criar score: {str(e)}"))
                        
                        self.stdout.write(self.style.SUCCESS(f"Scores criados para o programa {program.name}"))
                    except (ValueError, KeyError, Program.DoesNotExist) as e:
                        self.stdout.write(self.style.ERROR(f"Error creating program scores: {str(e)}"))
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f"Program scores CSV file not found at {scores_csv_path}"))
            return

        self.stdout.write(self.style.SUCCESS('Mock data loaded successfully.'))
