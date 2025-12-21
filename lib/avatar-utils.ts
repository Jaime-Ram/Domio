/**
 * Avatar Utilities
 * Helper functions for generating Untitled UI avatar URLs
 * Source: https://www.untitledui.com/resources/avatars
 */

// List of available Untitled UI avatars
const UNTITLED_AVATARS = [
  'abraham-baker',
  'adem-lane',
  'adil-floyd',
  'adriana-sullivan',
  'alec-whitten',
  'alesha-barry',
  'ali-mahdi',
  'aliah-lane',
  'alisa-hester',
  'amanda-lowery',
  'amelie-bennett',
  'amelie-laurent',
  'ammar-foley',
  'anaiah-whitten',
  'andi-lane',
  'angelica-wallace',
  'anita-cruz',
  'ashton-blackwell',
  'ashwin-santiago',
  'aston-hood',
  'ava-bentley',
  'ava-wright',
  'ayah-wilkinson',
  'aysha-becker',
  'bailey-richards',
  'bec-ferguson',
  'belle-woods',
  'benedict-doherty',
  'billie-wright',
  'blake-riley',
  'brianna-ware',
  'byron-robertson',
  'caitlyn-king',
  'cameron-yang',
  'candice-wu',
  'clifford-jennings',
  'cohen-lozano',
  'courtney-turner',
  'danyal-lester',
  'demi-wilkinson',
  'dillan-nguyen',
  'drew-cano',
  'eduard-franz',
  'elena-owens',
  'elisa-nishikawa',
  'elsie-roy',
  'erica-wyatt',
  'ethan-campbell',
  'ethan-valdez',
  'eva-bond',
  'eve-leroy',
  'fergus-gray',
  'fleur-cook',
  'florence-shaw',
  'frank-whitaker',
  'franklin-mays',
  'freya-browning',
  'genevieve-mclean',
  'harriet-rojas',
  'harry-bender',
  'hasan-johns',
  'herbert-fowler',
  'isla-allison',
  'isobel-carroll',
  'isobel-fuller',
  'jackson-reed',
  'jay-shepard',
  'jaya-willis',
  'jayden-moss',
  'jessie-meyton',
  'jonathan-kelly',
  'jordan-burgess',
  'joshua-wilson',
  'julius-vaughan',
  'kaden-scott',
  'kaitlin-hale',
  'kari-rasmussen',
  'kate-morrison',
  'katherine-moss',
  'katy-fuller',
  'kelly-williams',
  'kelsey-lowe',
  'koray-okumus',
  'kyla-clay',
  'lana-steiner',
  'levi-rocha',
  'leyton-fields',
  'liam-hood',
  'lily-rose-chedjou',
  'loki-bright',
  'lola-sanders',
  'lori-bryson',
  'lucy-bond',
  'lulu-meyers',
  'luqman-anthony',
  'lyle-kauffman',
  'maddison-gillespie',
  'madeleine-pitts',
  'marco-gross',
  'marco-kelly',
  'marvin-robbins',
  'mathilde-lewis',
  'maxwell-tan',
  'mikey-lawrence',
  'mollie-hall',
  'molly-vaughan',
  'nala-goins',
  'natali-craig',
  'nic-fassbender',
  'nicola-harris',
  'nicolas-trevino',
  'nicolas-wang',
  'nikolas-gibbons',
  'noah-pierre',
  'noel-baldwin',
  'olivia-rhye',
  'olly-schroeder',
  'orlando-diggs',
  'owen-garcia',
  'owen-harding',
  'phoenix-baker',
  'pippa-wilkinson',
  'priya-shepard',
  'rachael-strong',
  'rayhan-zua',
  'rene-wells',
  'rhea-levine',
  'rhianna-shepard',
  'riley-moore',
  'rory-huff',
  'rosalee-melvin',
  'sally-mason',
  'sarah-page',
  'scott-clayton',
  'sienna-hewitt',
  'sophia-perez',
  'stefan-sears',
  'youssef-roberson',
  'zahir-mays',
  'zahra-christensen',
  'zaid-schwartz',
  'zara-bush',
  'zaynab-donnelly',
  'zuzanna-burke',
]

/**
 * Generate a consistent avatar URL for a user based on their ID or name
 * This ensures the same user always gets the same avatar
 */
export function getUntitledAvatarUrl(identifier: string | null | undefined): string {
  if (!identifier) {
    // Return a random avatar if no identifier
    const randomIndex = Math.floor(Math.random() * UNTITLED_AVATARS.length)
    const avatarName = UNTITLED_AVATARS[randomIndex]
    return `https://www.untitledui.com/images/avatars/${avatarName}?w=256&h=256&q=90&fm=webp`
  }

  // Convert identifier to a number for consistent selection
  let hash = 0
  for (let i = 0; i < identifier.length; i++) {
    const char = identifier.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }

  // Use absolute value to get positive index
  const index = Math.abs(hash) % UNTITLED_AVATARS.length
  const avatarName = UNTITLED_AVATARS[index]

  // Untitled UI avatars - Direct CDN URLs
  // Avatars are available at: https://www.untitledui.com/images/avatars/[avatar-name]
  // Based on the website structure, we can use these direct image URLs
  return `https://www.untitledui.com/images/avatars/${avatarName}?w=256&h=256&q=90&fm=webp`
}

/**
 * Get avatar URL with fallback logic:
 * 1. Use custom avatar_url if provided
 * 2. Use profile_picture if provided
 * 3. Fallback to Untitled UI avatar based on user ID or name
 */
export function getAvatarUrl(
  customUrl?: string | null,
  profilePicture?: string | null,
  userId?: string | null,
  userName?: string | null
): string {
  // First try custom URL
  if (customUrl) {
    return customUrl
  }

  // Then try profile picture
  if (profilePicture) {
    return profilePicture
  }

  // Finally, use Untitled UI avatar based on user ID or name
  const identifier = userId || userName
  return getUntitledAvatarUrl(identifier)
}

