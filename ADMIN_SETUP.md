# Admin Dashboard Setup

This guide will help you set up admin access for the Sourdough Co. dashboard in development.

## Prerequisites

1. **Clerk Account**: You'll need a Clerk account and application set up
2. **Convex Project**: Your Convex project should be deployed and running
3. **Environment Variables**: Proper Clerk environment variables configured

## Environment Variables Required

Create a `.env.local` file in your project root with the following variables:

```bash
# Clerk Configuration
CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
CLERK_JWT_ISSUER_DOMAIN=https://your-app-name.clerk.accounts.dev

# Convex Configuration
VITE_CONVEX_URL=https://your-convex-deployment.convex.cloud
```

### Getting Your Clerk Variables

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. In the sidebar, go to **API Keys**
4. Copy the **Publishable key** and **Secret key**
5. For the JWT Issuer Domain:
   - Go to **JWT Templates** in the sidebar
   - Create or edit the "convex" template
   - The issuer URL will be shown there (format: `https://your-app-name.clerk.accounts.dev`)

## Setting Up Admin Access

### Method 1: Development Setup Page (Recommended)

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:3000/setup-admin`

3. Sign in with your Clerk account (or create a new account)

4. Click "Grant Admin Access" to add yourself as an admin

5. Navigate to `/admin` to access the dashboard

### Method 2: Direct Database Access

If you have direct access to your Convex database, you can manually add admin users:

1. Get your user ID from Clerk (visible on the setup page)

2. In your Convex dashboard, go to the Data tab

3. In the `admins` table, create a new document:
   ```json
   {
     "userId": "user_your_clerk_user_id_here",
     "role": "admin"
   }
   ```

## Security Notes

### Development vs Production

- **Development**: Use the setup page (`/setup-admin`) for easy admin creation
- **Production**:
  - Remove or restrict access to the setup page
  - Manually manage admin users through your database
  - Consider implementing admin invitation flows

### Admin Route Protection

The admin routes are protected by:

1. **Authentication**: Users must be signed in via Clerk
2. **Authorization**: Users must exist in the `admins` table
3. **Role-based Access**: Only users with `role: "admin"` can access admin routes

### Customization

To modify admin access:

1. **Add more roles**: Extend the schema in `convex/schema.ts`
2. **Custom permissions**: Modify the auth checks in `convex/auth.ts`
3. **UI improvements**: Update the admin dashboard in `app/routes/_authed/admin/`

## Troubleshooting

### "Not authenticated" Error

- Ensure Clerk is properly configured
- Check that your JWT issuer domain is correct
- Verify environment variables are loaded

### "Access Denied" Error

- Confirm your user is in the `admins` table
- Check that the `userId` matches your Clerk user ID exactly
- Verify the role is set to "admin"

### Cannot Access Setup Page

- Ensure the route exists at `/setup-admin`
- Check that Convex is running and connected
- Verify your Convex schema includes the `admins` table

## Next Steps

Once admin access is working:

1. **Customize the Dashboard**: Modify `app/routes/_authed/admin/index.tsx`
2. **Add Admin Features**: Create new admin routes and components
3. **Secure for Production**: Implement proper admin management workflows

## Support

If you encounter issues:

1. Check the browser console for errors
2. Verify all environment variables are set
3. Confirm Clerk and Convex are properly connected
4. Check the Convex logs for authentication errors
