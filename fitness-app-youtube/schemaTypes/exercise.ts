import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'exercise',
  title: 'Exercise',
  type: 'document',
  icon: () => '💪',
  description: 'A collection of exercises with images, difficulty levels, and video tutorials.',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      description: 'The name of the exercise, e.g., Push-up or Squat.',
      type: 'string',
      validation: (Rule) => Rule.required().min(2).error('Exercise name is required.'),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      description: 'A short summary explaining what the exercise is and how to perform it.',
      type: 'text',
      validation: (Rule) => Rule.required().min(10).error('Please provide a meaningful description.'),
    }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty',
      description: 'Select the difficulty level of the exercise.',
      type: 'string',
      options: {
        list: [
          { title: 'Beginner', value: 'beginner' },
          { title: 'Intermediate', value: 'intermediate' },
          { title: 'Advanced', value: 'advanced' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required().error('Please select a difficulty level.'),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      description: 'An image showing the correct form or position for the exercise.',
      type: 'image',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description:
            "Remember to use alt text for accessibility and SEO. Describe what's happening in the image.",
        }),
      ],
      validation: (Rule) => Rule.required().error('Please upload an exercise image.'),
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      description: 'A link to a video demonstration of the exercise (e.g., YouTube or Vimeo).',
      type: 'url',
      validation: (Rule) =>
        Rule.uri({
          allowRelative: false,
          scheme: ['http', 'https'],
        }).error('Please provide a valid video URL.'),
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active?',
      description:
        'Toggle this on to make the exercise visible on the website. Turn it off to hide it temporarily.',
      type: 'boolean',
      initialValue: true,
    }),
  ],

  preview: {
    select: {
      title: 'name',
      subtitle: 'difficulty',
      media: 'image',
      isActive: 'isActive',
    },
    prepare(selection) {
      const { title, subtitle, isActive, media } = selection
      return {
        title: title || 'Untitled Exercise',
        subtitle: `${subtitle ? subtitle.charAt(0).toUpperCase() + subtitle.slice(1) : ''} ${
          isActive ? '✅ Active' : '🚫 Inactive'
        }`,
        media,
      }
    },
  },
})
