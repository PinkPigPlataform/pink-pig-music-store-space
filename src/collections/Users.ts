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
      generateEmailHTML: async ({ token, req }) => {
        // OAuth-created users are already _verified: true.
        // Returning '' causes Resend to reject with 422 (missing html field).
        // Return a minimal valid HTML instead — the email is harmless since the
        // user is already verified and will never need to click anything.
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
