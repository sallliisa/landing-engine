import { getLocale } from '$lib/paraglide/runtime.js';
import { getLanguagePrefix } from '$lib/utils/common.js';
import prisma from '$lib/utils/prisma.js';
import { error, redirect } from '@sveltejs/kit';

function getFullSlugPath(node: any): string {
  const parts: string[] = [];

  function collect(node: any) {
    if (!node) return;
    if (node.parent) collect(node.parent);
    parts.push(node.slug);
  }

  collect(node);
  return '/' + parts.join('/');
}

export async function load({params, url, untrack}) {
  console.log('RAN MAIN LAYOUT')
  const [menu, primaryMenu, companyProfile] = await Promise.all([
    prisma.menuItem.findMany({
      where: {
        level: 1,
      },
      orderBy: {
        order: 'asc'
      },
      select: {
        menu_item_type: true,
        visible: true,
        url: true,
        slug: true,
        show_submenu_below_navbar: true,
        translations: {
          where: {
            language: getLocale(),
          },
          select: {
            id: true,
            name: true
          },
        },
        page: {
          select: {
            translations: {
              where: {
                language: getLocale(),
              },
              select: {
                id: true,
                sectionGroups: {
                  select: {
                    id: true
                  }
                }
              }
            },
          }
        },
        children: {
          orderBy: {order: 'asc'},
          select: {
            menu_item_type: true,
            visible: true,
            url: true,
            slug: true,
            show_submenu_below_navbar: true,
            translations: {
              where: {
                language: getLocale(),
              },
              select: {
                id: true,
                name: true
              },
            },
            page: {
              select: {
                translations: {
                  where: {
                    language: getLocale(),
                  },
                  select: {
                    id: true,
                    sectionGroups: {
                      select: {
                        id: true
                      }
                    }
                  }
                },
              }
            },
            children: {
              orderBy: {order: 'asc'},
              select: {
                menu_item_type: true,
                visible: true,
                url: true,
                slug: true,
                show_submenu_below_navbar: true,
                translations: {
                  where: {
                    language: getLocale(),
                  },
                  select: {
                    id: true,
                    name: true
                  },
                },
                page: {
                  select: {
                    translations: {
                      where: {
                        language: getLocale(),
                      },
                      select: {
                        id: true,
                        sectionGroups: {
                          select: {
                            id: true
                          }
                        }
                      }
                    },
                  }
                },
              }
            }
          }
        }
      }
    }),
    prisma.menuItem.findFirst({
      where: {primary: true},
      select: {
        slug: true,
        parent: {
          select: {
            slug: true,
            parent: {
              select: {
                slug: true,
              }
            }
          }
        }
      }
    }),
    prisma.companyProfile.findFirst({where: {id: 1}}),
  ])

  if (primaryMenu && untrack(() => url.pathname == '/')) {
    return redirect(308, getFullSlugPath(primaryMenu))
  }

  return {
    menu: menu
            .map((item) => ({
              ...item,
              name: item.translations[0].name,
              page: item.page?.[0],
              children: item.children.map((item) => ({
                ...item,
                name: item.translations[0].name,
                page: item.page?.[0],
                children: item.children.map((item) => ({
                  ...item,
                  name: item.translations[0].name,
                  page: item.page?.[0],
                }))
              }))
            })),
    primaryMenuPath: primaryMenu ? getFullSlugPath(primaryMenu) : '',
    companyProfile,
    // currentPageSectionGroup: currentPageSectionGroup
  }
}