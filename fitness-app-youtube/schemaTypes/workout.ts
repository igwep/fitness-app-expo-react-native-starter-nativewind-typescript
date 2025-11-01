import { defineField, defineType } from 'sanity'

export const workout = defineType({
  name: 'workout',
  title: 'Workout',
  type: 'document',
  fields: [
    defineField({
      name: 'userId',
      title: 'User ID',
      description: 'The Clerk user ID associated with this workout.',
      type: 'string',
      validation: (Rule) => Rule.required().error('User ID is required.'),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required().error('Workout date is required.'),
    }),
    defineField({
      name: 'duration',
      title: 'Duration (seconds)',
      type: 'number',
      validation: (Rule) =>
        Rule.required()
          .positive()
          .integer()
          .error('Duration must be a positive integer.'),
    }),
    defineField({
      name: 'exercises',
      title: 'Exercises',
      type: 'array',
      of: [
        defineField({
          name: 'exerciseEntry',
          title: 'Exercise Entry',
          type: 'object',
          fields: [
            defineField({
              name: 'exercise',
              title: 'Exercise',
              type: 'reference',
              to: [{ type: 'exercise' }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'sets',
              title: 'Sets',
              type: 'array',
              of: [
                defineField({
                  name: 'set',
                  title: 'Set',
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'reps',
                      title: 'Repetitions',
                      description:
                        'The number of repetitions completed for this exercise.',
                      type: 'number',
                      validation: (Rule) =>
                        Rule.required()
                          .positive()
                          .integer()
                          .error('Reps must be a positive integer.'),
                    }),
                    defineField({
                      name: 'weight',
                      title: 'Weight',
                      description:
                        'The weight lifted for this exercise set (if applicable).',
                      type: 'number',
                      validation: (Rule) =>
                        Rule.min(0).error(
                          'Weight must be 0 or higher (use 0 for bodyweight exercises).'
                        ),
                    }),
                    defineField({
                      name: 'weightUnit',
                      title: 'Weight Unit',
                      description:
                        'The unit of measurement for the weight (lbs or kg).',
                      type: 'string',
                      options: {
                        list: [
                          { title: 'Kilograms (kg)', value: 'kg' },
                          { title: 'Pounds (lbs)', value: 'lbs' },
                        ],
                        layout: 'radio',
                      },
                      initialValue: 'kg',
                    }),
                  ],
                  preview: {
                    select: {
                      reps: 'reps',
                      weight: 'weight',
                      weightUnit: 'weightUnit',
                    },
                    prepare({ reps, weight, weightUnit }) {
                      const displayWeight =
                        weight && weight > 0
                          ? `${weight}${weightUnit === 'lbs' ? ' lbs' : ' kg'}`
                          : 'Bodyweight'
                      return {
                        title: `💪 ${reps ?? '?'} reps`,
                        subtitle: displayWeight,
                      }
                    },
                  },
                }),
              ],
              validation: (Rule) =>
                Rule.required()
                  .min(1)
                  .error('Please add at least one set.'),
            }),
          ],
          preview: {
            select: {
              exerciseName: 'exercise.name', // ✅ Use the exercise name
              sets: 'sets',
            },
            prepare({ exerciseName, sets }) {
              const setCount = sets ? sets.length : 0
              return {
                title: `🏋️ ${exerciseName || 'Unnamed Exercise'}`,
                subtitle: `${setCount} ${setCount === 1 ? 'set' : 'sets'}`,
              }
            },
          },
        }),
      ],
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .error('Please add at least one exercise.'),
    }),
  ],
  preview: {
    select: {
      date: 'date',
      duration: 'duration',
      exercises: 'exercises',
    },
    prepare({ date, duration, exercises }) {
      const totalExercises = exercises ? exercises.length : 0
      const formattedDate = new Date(date).toLocaleDateString()
      const formattedTime = new Date(date).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
      const minutes = Math.floor(duration / 60)
      const seconds = duration % 60
      return {
        title: `🏋️ Workout - ${formattedDate} ${formattedTime}`,
        subtitle: `${totalExercises} exercises | Duration: ${minutes}m ${seconds}s`,
      }
    },
  },
})
