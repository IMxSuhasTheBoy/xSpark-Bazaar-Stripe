# XSparkBazaar

Primary Tagline: "Where Global Commerce Sparks Innovation"

< Don't gather requirements - dig for them. Requirements rarely lie on the surface. They're buried deep beneath layers of assumptions, misconceptions, and politics. >

## Brand Positioning Statement for XSparkBazaar

- For [Target Audience]:
  Multi-tenant businesses seeking digital transformation
  Entrepreneurs looking to establish online marketplaces
  Enterprises requiring scalable e-commerce solutions
  Businesses aiming to expand their digital presence
  Organizations seeking integrated commerce platforms

- Who [Need/Problem]:
  Need a reliable, scalable e-commerce platform
  Struggle with managing multiple vendors efficiently
  Face challenges in digital transformation
  Require seamless integration of business operations
  Need a solution that grows with their business

- XSparkBazaar [Brand Name]:
  Is a comprehensive multi-tenant e-commerce platform
  Provides end-to-end marketplace solutions
  Offers scalable and customizable features
  Delivers secure and efficient transaction processing
  Ensures seamless vendor and customer management

- That [Key Benefit]:
  Enables businesses to create and manage their own digital marketplaces
  Provides tools for efficient multi-vendor management
  Offers scalable solutions that grow with business needs
  Ensures secure and reliable transaction processing
  Delivers comprehensive analytics and insights

- Unlike [Competition]:
  Traditional e-commerce platforms
  Limited marketplace solutions
  Single-tenant systems
  Basic online store builders
  Non-scalable solutions

- Our Brand [Differentiation]:
  Offers true multi-tenant architecture
  Provides comprehensive marketplace management
  Ensures enterprise-grade security
  Delivers customizable solutions
  Offers 24/7 support and expertise

- Brand Promise:
  "Empowering businesses to create, manage, and grow their digital marketplaces with confidence and innovation."
  Brand Personality:
  Innovative
  Professional
  Reliable
  Forward-thinking
  Supportive
  Global-minded

- Brand Voice:
  Clear and professional
  Solution-oriented
  Confident but approachable
  Technical yet understandable
  Forward-thinking and innovative

- Brand Values:
  Innovation: Continuously evolving to meet market needs
  Reliability: Providing stable and secure solutions
  Growth: Supporting business expansion and success
  Partnership: Building long-term relationships
  Excellence: Delivering high-quality solutions
  Global Perspective: Understanding diverse market needs

- Brand Mission:
  "To revolutionize digital commerce by providing innovative, scalable, and secure multi-tenant marketplace solutions that empower businesses to thrive in the digital economy."
  Brand Vision:
  "To be the global leader in multi-tenant e-commerce solutions, transforming how businesses create and manage digital marketplaces."

- Key Messages:
  "Your Success is Our Priority"
  "Innovation at Every Step"
  "Growth Without Limits"
  "Security You Can Trust"
  "Solutions That Scale"

- Brand Experience:
  Seamless onboarding process
  Intuitive platform interface
  Comprehensive support system
  Regular feature updates
  Proactive customer service
  Educational resources and training
  Brand Positioning Matrix:
  Innovation: High
  Reliability: High
  Scalability: High
  Security: High
  Support: High
  Customization: High

  - This positioning statement provides a comprehensive framework for:
    Marketing communications
    Product development
    Customer service
    Brand strategy
    Market positioning
    Competitive differentiation

## 01 getting started env setup

1.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               runtime & pkg manager : bun.js
2.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               npm i === bun add - npx === bunx
3.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               nextjs ^15.3.0 project setup
4.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               typescript ^5
5.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               tailwindcss ^4
6.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               shadcnui ^2.4.1 & --all ui components
7.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               nuqs ^2.4.3
8.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               payloadcms/plugin-multi-tenant ^2.4.3
9.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               zustand ^5.0.4

## 02 customizations

- modify look & feel

  - added DMsans font
  - neobrutalism style

- modify globals.css

  - modified radious, borders, etc.

## 03 home layout

- route group for home layout

- foundational home layout that includes a navbar, main content area, and footer
- few new Pages
- navbar
- mobile navbar
- footer

## 04 payload cms integration

- database setup

  - MongoDB integration for nested & relational data.
  - integrated Payload CMS with MongoDB, enabling content management, authentication and admin interface.

- Collections implemented

  - added collections for Users (with authentication), Media (file uploads).

- implemented API routes for REST and GraphQL endpoints, including GraphQL Playground.
- API endpoints and admin interface routes are auto-generated for Payload, enabling REST, GraphQL, and admin UI functionality.

## 05 search filters

- `categories` collection configured & enhanced for search filters

  - slug
  - subcategories
  - relationships

- Search filters implemented

  - search input
  - displaying categories
  - subcategory dropdown

## 06 categories ui finalized

- seeding categories

  - database seeding script to populate categories with subcategories

- custom category type (temporary)

- responsiveness

  - categories navigation hides overflow categories and adapts to screen size by dynamically truncating categories
  - category navigation sidebar for improved browsing on mobile and desktop
  - "View All" button and sidebar for categories, enabling hierarchical category navigation and easy access to all categories
  -

## 07 tRPC Set up with a React Server Components (RSC) framework

- tRPC backend and router:
  - tRPC server context setup, base router, and base procedure middleware for Payload CMS integration
  - tRPC React client setup with React Query integration and provider component
  - utility to create a React Query client with custom cache and hydration settings
  - main tRPC app router, integrating the categories router and exporting types
  - modules for tRPC server/client setup, query client instantiation
  - server-only tRPC proxy and cached query client getter for server-side usage
- "categoriesRouter"
  - categories API endpoint that provides categories with subcategories
  - pre-fetch categories in layout component
  - react Query for efficient client-side data fetching and caching internally in categories sidebar component
  - replaced custom category types with types inferred from tRPC outputs
- refactored components to fetch data internally via tRPC, removed data prop drilling and centralized data management

## 08 authentication

- updates to "Users" collection
  - "username" field
- authentication procedures (trpc auth routers)
  - using payload auth utils
  - validation schemas for registration and login using Zod for validation
- authentication screens
  - login and register pages and corresponding ui components
- toast notifications are integrated into the root layout
- password confirmation field with real-time validation feedback in register form

## 09 auth states

- automatically set cookie on login using payload REST API
- authenticated states:
  - navigation and search filters dynamically display authentication-dependent options, such as "Dashboard" or "Library" buttons, based on users login state
  - already logged-in users are redirected away from sign-in and sign-up pages
  - performs server-side session checks for cache invalidation on login/register

## 10 category pages routing

- dynamic extraction of URL parameters
  - nested dynamic routing pages of categories and subcategories
  - background color of search filters adapts to the current selected main category
  - breadcrumb navigation for category pages

## 11 products collection

- "Products" collection

  - fields for name, description, price, category, image, and refund policy.
  - admin configuration
  - relation with categories and media

- products data loading based on category using tRPC and React Query
  - server-side data prefetching in RSC
  - client-side suspense loading and hydration
  - loads products data of subcategory based on subcategory
  - loads products data of all subcategory (and category\*) based on category

## 12 product filters section

- NUQS configuration

  - wrapped app in NuqsAdapter for query state management.
  - useProductFilters hook for managing filter query states synced with URL query parameters

- price filter interface

  - min/max input fields
  - input change handlers
  - formatting function

- category page layout updates

  - product filters component
  - products responsive grid layout

- procedure updates
  - processes raw price filter values

## 13 API filters & sorting

- filters connected to APIs

- centralized and extended query parameter parsing for product filters; added support for sorting and tags.

- "Tags" collection

  - many-to-many relation with products

- tags filter procedure

  - infinite load

- sorting options interface
  - connected to APIs

## 14 product list interface

- "product-list-view" component

  - reusable for pages of nested categories
  - handles multiple components of product display
    - integrates sorting filtering options
    - suspense wrapped "product-list" component with skeleton fallback

- "product-card" component
  - product details
  - loading placeholders
- "product-list" modified:
  - integrates card component
  - uses "useProductFilters" hooks to work with sorting & filtering options,
  - paginated/infinite loading functionality
  - uses skeleton for loading placeholders
  - empty/error state handling
- categary page refactors

  - simplified the JSX structure with ProductListView component
  - removed explicit suspense, filter, and sort UI
  - "searchParams" prop for calling the loading functions for product filters

- product procedure updates & refactors

  - getMany procedure supports pagination via cursor and limit inputs
  - updated product data transformation for images

- refactored & improved components:
  - tags-filter
  - product-sort

## 15 multi tenant support

    goal: each product and user to be able to be associated with specific tenant. Integrated with payload plugin for multi-tenant support within admin panel.

- "Tenants" collection
- "User" collection updates
  - roles field
  - integrated multi-tenant field from the plugin
  - creates tenant on user registration
- "multi tenant" plugin configuration
- "Products" collection connected to tenant
  - each product will belong to a tenant
  - added a new Tenants management interface and integrated tenant selection in the admin UI
- registeration procedure updates

  - creates tenant using username first returns tenant id
  - with user data including tenant id, automatically assosiates new user with the tenant

- product listing page refactors

  - switched data prefetching from standard to infinite queries
  - updated query options to support pagination
  - included a default limit parameter

- home page refactors

  - updated to an async server component to render all products in categories at once using ProductListView component similar to category pages

- seed file refactors
  - updated seeding to create an admin tenant and super-admin user before seeding categories

## 16 tenant pages

- "product-card" component refactors

  - load & display tenant information
  - added click handler to navigate to tenant URL

- "product-list" updates

  - Added tenantSlug and narrowView props
  - filtered products by tenant
  - updated grid layout and skeleton

- "tenantSlug" filter to products "getMany" procedure (query by an individual tenant)

- tenant specific home pages

  - dedicated layouts, navigation bars, and footers
  - data prefetching and hydration
  - tenant-aware routing
    - internal route: /tenant/[slug]
    - strategy: internal route converts to [slug].example-domain.com

- tenantsRouter router updates
  -getOne method for fetching tenant by slug including image

- tenants management interface and tenant selection UI

## 17 product page

- product procedure updates

  - getOne method for fetching product by id including images & tenant info

- page component consisting productView

  - /tenants/[slug]/products/[productId]
  - "product-vew" component for specifc product by id
    - responsive & detailed view for individual product
    - ratings using StarRating component

- "product-card" updates

  - dynamic url generation for link to tenant-scoped specific product page (product-view component)

- currency formatting utility

- products collection updates
  - media type cover field

## 18 cart state & interface

- cart functionality

      strategy: tenant-specific individual cart for every tenant

  - zustand global store
  - store configuration
  - useCart hook for streamlined operations

- "product-view" updates

  - dynamic loading of "cart-button" component without SSR to avoid hydration errors
  - "cart-button" component
    - adds or romoves item with dynamic feedback & appearance (toggles product presence in tenant-specific cart)

- tenant navbar updates
  - "checkout-button" component (tenant specific cart checkout link)
    - real-time cart item counts for checkout functionality

## 19 checkout page

- checkout page
  - tenant-specific cart "checkout-view" component
    - "checkout-view" component for displaying indiviual cart items
    - "checkout-sidebar" component for checkout summary & actions
- checkout layout
  - navbar
  - footer
- checkout procedure
  - getProducts method for fetching & processing tenant-specific cart items
    - validates document count
    - computes total pricing

<!-- https://dashboard.razorpay.com/app/website-app-settings/webhooks -->

## 20 payment integration

- razorpay payment processing for checkout
- webhook event handling
- use-cart-state updates
- Orders collection
- TRPC updates
  - protected procedure for authenticated API requests
