import { getLocale } from '$lib/paraglide/runtime.js';
import { getLanguagePrefix } from '$lib/utils/common.js';
import prisma from '$lib/utils/prisma.js';
import { error, redirect } from '@sveltejs/kit';

function getCurrentPageSectionGroup(menu: any[], pathname: string[]) {
  for (const menuItem of menu) {
    if (menuItem.slug === pathname[0]) {
      if (pathname.length === 1) return menuItem.page[0]?.translations[0].id || null
      return getCurrentPageSectionGroup(menuItem.children, pathname.slice(1))
    }
  }
}

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

export async function load({params, url}) {
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
    // prisma.adBannerLanguageMap.findMany({
    //   where: {active: true},
    //   include: {
    //     adBanner: {
    //       where: {language: languageTag()}
    //     }
    //   }
    // })
  ])

  // if (['/en', '/en/'].includes(url.pathname)) {
  //   throw redirect(308, `/en/${menu[0].translations[0].slug}/${menu[0].submenuLanguageMap[0].code}`);
  // }

  // if (['/id', '/id/'].includes(url.pathname)) {
  //   throw redirect(308, `/id/${menu[0].code}/${menu[0].submenuLanguageMap[0].code}`);
  // }

  console.log(url.pathname)

  if (primaryMenu && url.pathname == '/') {
    console.log(primaryMenu)
    return redirect(308, getFullSlugPath(primaryMenu))
  }

  const currentPageSectionGroup = getCurrentPageSectionGroup(menu, url.pathname.split('/').slice(1))
  if (!currentPageSectionGroup) throw error(404, 'Page not found')

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
    currentPageSectionGroup: currentPageSectionGroup
  }
}