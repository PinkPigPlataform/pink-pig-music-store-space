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
        if (req?.context?.isOAuthCreate ||
          req?.context?.skipVerificationEmail ||
          req?.context?.disableVerificationEmail) return 'Welcome'
        return 'Verify your email'
      },
      generateEmailHTML: async ({ token, req }) => {
        // Skip verification email for OAuth users — they are already _verified: true.
        // Return ' ' (single space) so Resend passes html-presence validation.
        if (req?.context?.isOAuthCreate ||
          req?.context?.skipVerificationEmail ||
          req?.context?.disableVerificationEmail) {
          return ' '
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
