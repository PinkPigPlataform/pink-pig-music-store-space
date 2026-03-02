import type { Access, CollectionConfig } from 'payload'
import { PrimaryActionEmailHtml } from '../components/emails/PrimaryActionEmail'

const adminsAndUser: Access = ({ req: { user } }) => {
  if (user?.role === 'admin') return true
  return { id: { equals: user?.id } }
}

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    verify: {
      generateEmailSubject: ({ req }) => {
        // Provide a subject for all cases — Resend may reject if subject is empty.
        if (req?.context?.isOAuthCreate) return 'Welcome'
        return 'Verify your email'
      },
      generateEmailHTML: async ({ token, req }) => {
        // OAuth-created users are already _verified: true.
        // Return a minimal valid HTML so Resend doesn't reject with 422.
        // The email is inert — user is already verified and needs no action.
        if (req?.context?.isOAuthCreate) {
          return '<html><body></body></html>'
        }

        return await PrimaryActionEmailHtml({
          actionLabel: 'verify your account',
          buttonText: 'Verify Account',
          href: `${process.env.NEXT_PUBLIC_SERVER_URL}/verify-email?token=${token}`,
        })
      },
    },
  },
  access: {
    read: adminsAndUser,
    create: () => true,
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  admin: {
    hidden: ({ user }) => user?.role !== 'admin',
    defaultColumns: ['id'],
  },
  fields: [
    {
      name: 'role',
      defaultValue: 'user',
      required: true,
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
    },
  ],
}
