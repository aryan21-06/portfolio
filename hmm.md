
## Route and Terminal Rendering

Routes are different URL states, not completely different websites. The same terminal shell surrounds every route while the route-specific content changes inside it.

```text
Root layout
  -> shared site layout
  -> shared TerminalShell
     -> terminal header
     -> previous command history
     -> current route command
     -> current route content
     -> command input and suggestions
```

For example, `/projects` can display:

```text
> ~/ $ cd projects && ls

/projects
- CosmikERP
- Prayog
- Swar
```

Then `/projects/cosmikerp` displays the same shell with different content:

```text
> ~/projects $ cd projects && cat cosmikerp

PROJECT: CosmikERP
...
```

The terminal frame remains consistent. Only the route command and route content change.

### State ownership

```text
URL                 current canonical page content
React state         temporary terminal history and input state
Firestore           editable portfolio content
Code                command behavior, layout, routes, and fixed local images
```

The URL is the source of truth. Terminal history is temporary. If a visitor refreshes `/projects/cosmikerp`, the project must still load even if the previous terminal transcript disappears.

### Route-to-command mapping

Every public route has an automatic command associated with it:

```text
/                         no automatic command
/skills                   cd skills && ls
/projects                 cd projects && ls
/projects/[slug]          cd projects && cat [slug]
/experience               cd experience && ls
/blogs                    cd blogs && ls
/blogs/[slug]             cd blogs && cat [slug]
/resume                   cat skills experience projects
```

The application uses `/blogs/[slug]`, so the direct URL for the seeded blog is `/blogs/om-namah-shivay`. If `/blog/[slug]` is preferred instead, change the route convention everywhere and do not mix singular and plural paths.

### Direct-link behavior

When a visitor opens `/blogs/first-post` directly:

```text
Browser requests /blogs/first-post
  -> Next.js matches blogs/[slug]/page.tsx
  -> the page receives slug = "first-post"
  -> the page fetches the blog from Firestore
  -> the page determines: cd blogs && cat first-post
  -> TerminalShell renders the command and blog content
```

The initial HTML should already contain the command and readable blog content. Do not wait for a client-side effect to fetch the article. Direct links must work for visitors who do not understand terminal commands.

### Typed-command behavior

When a visitor types:

```text
cd blogs
```

the command flow is:

```text
parse command
  -> find matching command handler
  -> router.push("/blogs")
  -> Next.js loads the blogs route
  -> the route renders cd blogs && ls and the blog list
```

When a visitor types:

```text
cat blogs/first-post
```

the command handler only navigates to:

```text
/blogs/first-post
```

The route then fetches and renders the blog. The command handler must not manually render the blog as well, otherwise the content will be duplicated.

### Appending versus replacing output

There are two separate concepts:

```text
Current route output       controlled by the URL; changes when the route changes
Terminal history           temporary client state; may show previous commands
```

The safest initial implementation is to render the current route output from the route and keep previous command echoes in client state. A direct deep link starts with the automatic command for that route. Internal command navigation may add the typed command to the temporary history before calling `router.push()`.

Do not make the entire portfolio content depend on a React history array. The history is not the source of truth and should not be required for refresh, bookmarking, SEO, or sharing.

### Component responsibilities

`TerminalShell` owns:

```text
terminal frame
input
keyboard handling
suggestion chips
temporary command history
current route command display
```

`ProjectsPage` owns:

```text
fetching published projects
rendering the project list
automatic command: cd projects && ls
```

`ProjectDetailPage` owns:

```text
reading the slug
fetching one project
rendering project details
automatic command: cd projects && cat [slug]
```

`CommandRegistry` owns:

```text
recognizing commands
validating arguments
converting commands into route destinations
```

The command registry must not contain project or blog rendering logic.

### Navigation command types

Commands that represent pages navigate to routes:

```text
cd projects
cat projects/cosmikerp
cd blogs
cat blogs/om-namah-shivay
resume
```

Commands that are only terminal behavior can render locally:

```text
help
clear
sudo make coffee
```

The rule is:

```text
page command   -> parse -> router.push() -> route renders content
local command  -> parse -> render local terminal output
```

### First implementation slice

Build one complete project flow before adding polish:

```text
1. Create the Firestore data layer.
2. Create /projects and fetch published projects.
3. Create /projects/[slug] and fetch one project by slug.
4. Display cd projects && ls on /projects.
5. Display cd projects && cat [slug] on the detail route.
6. Make cd projects navigate to /projects.
7. Make cat projects/cosmikerp navigate to /projects/cosmikerp.
8. Add the local CosmikERP image conditionally.
```

This slice is complete when editing a project in Firestore changes both project pages after refresh, while terminal commands and normal clickable links reach the same routes.

---

## UI/UX Architecture

The application has two experiences: a normal portfolio website and a terminal interface layered over it. The terminal is another way to navigate the website, not a replacement for real pages and URLs.

```text
User action
  -> command or clickable link
  -> URL changes
  -> Next.js route loads data
  -> page renders inside the terminal-style shell
```

### State ownership

```text
URL state       shareable state: /projects/cosmikerp, /blogs/om-namah-shivay
React state     temporary UI state: input, history, autocomplete, mobile menu
Firestore       editable content: projects, skills, experience, blogs, about
Code            behavior, routes, command parsing, layout, fixed local images
```

The URL is the source of truth for the current page. React state must not be the only place where a project or blog is open.

### UI layers

```text
App layout
  -> site shell and navigation
  -> terminal shell
     -> terminal header
     -> command output
     -> command input and suggestions
  -> route-specific content
```

The terminal shell owns input, command history, autocomplete, and keyboard behavior. It must not fetch or contain all portfolio content.

Route-specific components own presentation:

```text
ProjectList, ProjectDetail
BlogList, BlogDetail
SkillsList, ExperienceList
ResumeView
```

Data functions own Firestore access:

```text
getAbout()
getSkills()
getProjects()
getProjectBySlug(slug)
getExperience()
getBlogs()
getBlogBySlug(slug)
```

The normal data flow is:

```text
Firestore -> data function -> TypeScript type -> route page -> display component
```

### Public routes

```text
/                         landing terminal
/skills                   published skills
/projects                 published projects
/projects/[slug]          project detail
/experience               experience entries
/blogs                    published blogs
/blogs/[slug]             readable blog detail
/resume                   consolidated recruiter view
```

Every detail page must work when opened directly, refreshed, bookmarked, or shared on social media.

### Command behavior

Navigation commands map to real routes:

```text
cd projects                    -> /projects
cat projects/cosmikerp         -> /projects/cosmikerp
cd blogs                       -> /blogs
cat blogs/om-namah-shivay      -> /blogs/om-namah-shivay
resume                         -> /resume
```

Local-only commands do not need a route:

```text
help
clear
sudo make coffee
```

The command registry should decide whether a command produces local output or navigates to a URL. It should not contain project or blog rendering logic.

### Server and client responsibilities

Use server components for Firestore-backed public pages. Use client components only where browser interaction is required:

```text
Server: route pages, Firestore reads, project/blog rendering
Client: terminal input, history, autocomplete, admin forms, authentication UI
```

Do not make the whole application client-side just because the terminal input is interactive.

### Project media

Project data comes from Firestore, but the two known images are local assets:

```text
public/projects/cosmikerp.png
public/projects/prayog.png
```

The UI resolves these through a code-owned map. If a project has no matching local asset, it renders without an image. Firebase Storage is not part of this application.

## Build Order

Build one complete vertical slice before adding polish:

```text
1. Firestore data layer
2. /projects page
3. /projects/[slug] page
4. Local CosmikERP and Prayog image mapping
5. Terminal navigation for project routes
6. Skills and experience pages
7. Blogs and readable blog detail pages
8. Resume page
9. Firebase Auth and admin CRUD
10. Autocomplete, animation, mobile polish, and easter eggs
```

The first milestone is complete when editing a project in Firestore changes `/projects` and `/projects/[slug]` after refresh, while both terminal commands and normal links reach the same pages.

When deciding where a new feature belongs, classify it first:

```text
Editable content      -> Firestore
Shareable navigation   -> URL and Next.js route
Temporary interaction  -> React state
Permanent behavior     -> application code
Fixed media            -> public/ assets
```

### Project image handling

The seeded `imageUrl` field is empty for all projects. Do not add Firebase Storage for this portfolio.

Keep the two existing images as local application assets:

```text
public/projects/cosmikerp.png
public/projects/prayog.png
```

Resolve them in code using the project slug or document ID:

```text
cosmikerp -> /projects/cosmikerp.png
prayog    -> /projects/prayog.png
```

All other projects render without an image. Adding or changing one of these images requires a code change and deployment; ordinary project content remains editable in Firestore.
