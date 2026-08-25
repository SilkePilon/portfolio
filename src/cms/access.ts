import type { Access } from 'payload'

/** Anyone can read; only logged-in admin users can write. */
export const publicRead: Access = () => true
export const authenticated: Access = ({ req }) => Boolean(req.user)
