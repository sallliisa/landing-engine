import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt'

function parseSlug(text: string) {
  return text
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading and trailing whitespace
    .normalize("NFD") // Normalize to decompose accents
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric characters (except spaces and hyphens)
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with a single hyphen
}

const prisma = new PrismaClient();

const main = async () => {
  try {
    // Create Developer RoleGroup
    const developerGroup = await prisma.roleGroup.create({
      data: {
        name: "Developer",
      },
    });

    // Create Developer Role within Developer RoleGroup
    const developerRole = await prisma.role.create({
      data: {
        name: "Developer",
        role_group_id: developerGroup.id,
        // You might want to add permissions here later
        permissions: {
          create: [],
        },
      },
    });

    // Create Super Admin User
    const superAdmin = await prisma.user.create({
      data: {
        name: "Super Admin",
        email: "dev",
        password: await bcrypt.hash("devcid", 10),
        role_id: developerRole.id,
      },
    });

    // create instance of CompanyProfile
    const companyProfile = await prisma.companyProfile.create({
      data: {
        name: 'HK Realtindo',
        slogan: 'Membangun Properti Untuk Negeri',
        address: 'HK TOWER Lantai 17 Jl. Letjen M.T Haryono Kav 8, Cawang. Jakarta Timur 13340',
        email: 'corporate@hkrealtindo.com',
        phone: '(021)-8563570',
        whatsapp: '6285635700000',
        facebook: 'https://facebook.com/hkrealtindo',
        instagram: 'https://instagram.com/hkrealtindo',
        twitter: 'https://x.com/hkrealtindo',
        youtube: 'https://youtube.com/hkrealtindo',
        brochure: '',
      }
    })

    const [
      beranda,
      tentangKami,
      proyek,
      hubunganInvestor,
      gcg,
      media,
      csr,
      kontak,
      pelaporan,
    ] = await Promise.all([
      prisma.menuItem.create({
        data: {
          level: 1,
          slug: parseSlug('Beranda'),
          order: 1,
          primary: true,
          visible: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Beranda',
                },
                {
                  language: 'en',
                  name: 'Home',
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 1,
          slug: parseSlug('Tentang Kami'),
          order: 2,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Tentang Kami',
                },
                {
                  language: 'en',
                  name: 'About Us',
                }
              ]
            }
          },
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 1,
          slug: parseSlug('Proyek'),
          order: 3,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Proyek',
                },
                {
                  language: 'en',
                  name: 'Projects',
                }
              ]
            }
          },
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 1,
          slug: parseSlug('Hubungan Investor'),
          order: 4,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Hubungan Investor',
                },
                {
                  language: 'en',
                  name: 'Investor Relations',
                }
              ]
            }
          },
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 1,
          slug: parseSlug('GCG'),
          order: 5,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'GCG',
                },
                {
                  language: 'en',
                  name: 'GCG',
                }
              ]
            }
          },
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 1,
          slug: parseSlug('Media'),
          order: 6,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Media',
                },
                {
                  language: 'en',
                  name: 'Media',
                }
              ]
            }
          },
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 1,
          slug: parseSlug('CSR'),
          order: 7,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'CSR',
                },
                {
                  language: 'en',
                  name: 'CSR',
                }
              ]
            }
          },
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 1,
          slug: parseSlug('Kontak'),
          order: 8,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Kontak',
                },
                {
                  language: 'en',
                  name: 'Contact',
                }
              ]
            }
          },
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 1,
          slug: parseSlug('Pelaporan'),
          order: 9,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Pelaporan',
                },
                {
                  language: 'en',
                  name: 'Reporting',
                }
              ]
            }
          },
        }
      }),
    ])

    const [
      pesanDirektur,
      visiMisi,
      pencapaianPerusahaan,
      strukturOrganisasi,
      manajemen,
      anakPerusahaan,
      penghargaan,
      apartemen,
      perumahan,
      hotel,
      kantor,
      laporanTahunan,
      presentasiPerusahaan,
      sorotanKeuangan,
      laporanKeuangan,
      keterbukaanInformasi,
      informasiTender,
      komitmen,
      strukturGcg,
      panduanGcg,
      manajemenRisiko,
      sertifikasiIso,
      penilaian,
      promosiAcara,
      publikasi,
      artikel,
      video,
      hackathon,
      infoCsr,
      galeriCsr,
      whistleblowingSystem,
      gratifikasi,
    ] = await Promise.all([
      // Tentang Kami
      prisma.menuItem.create({
        data: {
          level: 2,
          parent_id: tentangKami.id,
          slug: parseSlug('Pesan Direktur'),
          order: 1,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Pesan Direktur',
                },
                {
                  language: 'en',
                  name: 'Message from the Director',
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 2,
          parent_id: tentangKami.id,
          slug: parseSlug('Visi & Misi'),
          order: 2,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Visi & Misi',
                },
                {
                  language: 'en',
                  name: 'Vision & Mission Statement',
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 2,
          parent_id: tentangKami.id,
          slug: parseSlug('Pencapaian Perusahaan'),
          order: 3,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Pencapaian Perusahaan',
                },
                {
                  language: 'en',
                  name: 'Achievements',
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 2,
          parent_id: tentangKami.id,
          slug: parseSlug('Struktur Organisasi'),
          order: 4,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Struktur Organisasi',
                },
                {
                  language: 'en',
                  name: 'Organizational Structure',
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 2,
          parent_id: tentangKami.id,
          slug: parseSlug('Manajemen'),
          order: 5,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Manajemen',
                },
                {
                  language: 'en',
                  name: 'Management',
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 2,
          parent_id: tentangKami.id,
          slug: parseSlug('Anak Perusahaan'),
          order: 6,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Anak Perusahaan',
                },
                {
                  language: 'en',
                  name: 'Subsidiaries',
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 2,
          parent_id: tentangKami.id,
          slug: parseSlug('Penghargaan'),
          order: 7,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Penghargaan',
                },
                {
                  language: 'en',
                  name: 'Awards',
                }
              ]
            }
          }
        }
      }),
      // Proyek
      prisma.menuItem.create({
        data: {
          level: 2,
          parent_id: proyek.id,
          slug: parseSlug('Apartemen'),
          order: 1,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Apartemen',
                },
                {
                  language: 'en',
                  name: 'Apartment',
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 2,
          parent_id: proyek.id,
          slug: parseSlug('Perumahan'),
          order: 2,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Perumahan',
                },
                {
                  language: 'en',
                  name: 'Housing',
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 2,
          parent_id: proyek.id,
          slug: parseSlug('Hotel'),
          order: 3,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Hotel',
                },
                {
                  language: 'en',
                  name: 'Hotel',
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 2,
          parent_id: proyek.id,
          slug: parseSlug('Kantor'),
          order: 4,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Kantor',
                },
                {
                  language: 'en',
                  name: 'Office',
                }
              ]
            }
          }
        }
      }),
      // Hubungan Investor
      prisma.menuItem.create({
        data: {
          level: 2,
          parent_id: hubunganInvestor.id,
          slug: parseSlug('Laporan Tahunan'),
          order: 1,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Laporan Tahunan',
                },
                {
                  language: 'en',
                  name: 'Annual Report',
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 2,
          parent_id: hubunganInvestor.id,
          slug: parseSlug('Presentasi Perusahaan'),
          order: 2,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Presentasi Perusahaan',
                },
                {
                  language: 'en',
                  name: 'Company Presentation',
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 2,
          parent_id: hubunganInvestor.id,
          slug: parseSlug('Sorotan Keuangan'),
          order: 3,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Sorotan Keuangan',
                },
                {
                  language: 'en',
                  name: 'Financial Highlights',
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 2,
          parent_id: hubunganInvestor.id,
          slug: parseSlug('Laporan Keuangan'),
          order: 4,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Laporan Keuangan',
                },
                {
                  language: 'en',
                  name: 'Financial Reports',
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 2,
          parent_id: hubunganInvestor.id,
          slug: parseSlug('Keterbukaan Informasi'),
          order: 5,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Keterbukaan Informasi',
                },
                {
                  language: 'en',
                  name: 'Information Disclosure',
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 2,
          parent_id: hubunganInvestor.id,
          slug: parseSlug('Informasi Tender'),
          order: 6,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Informasi Tender',
                },
                {
                  language: 'en',
                  name: 'Tender Information',
                }
              ]
            }
          }
        }
      }),
      // GCG
      prisma.menuItem.create({
        data: {
          level: 2,
          parent_id: gcg.id,
          slug: parseSlug('Komitmen'),
          order: 1,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Komitmen',
                },
                {
                  language: 'en',
                  name: 'Commitment',
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 2,
          parent_id: gcg.id,
          slug: parseSlug('Struktur GCG'),
          order: 2,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Struktur GCG',
                },
                {
                  language: 'en',
                  name: 'GCG Structure',
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 2,
          parent_id: gcg.id,
          slug: parseSlug('Panduan GCG'),
          order: 3,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Panduan GCG',
                },
                {
                  language: 'en',
                  name: 'GCG Guidelines',
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 2,
          parent_id: gcg.id,
          slug: parseSlug('Manajemen Risiko'),
          order: 4,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Manajemen Risiko',
                },
                {
                  language: 'en',
                  name: 'Risk Management',
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 2,
          parent_id: gcg.id,
          slug: parseSlug('Sertifikasi ISO'),
          order: 5,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Sertifikasi ISO',
                },
                {
                  language: 'en',
                  name: 'ISO Certification',
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 2,
          parent_id: gcg.id,
          slug: parseSlug('Penilaian'),
          order: 6,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Penilaian',
                },
                {
                  language: 'en',
                  name: 'Assessment',
                }
              ]
            }
          }
        }
      }),
      // Media
      prisma.menuItem.create({
        data: {
          level: 2,
          parent_id: media.id,
          slug: parseSlug('Promosi & Acara'),
          order: 1,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Promosi & Acara',
                },
                {
                  language: 'en',
                  name: 'Promotions & Events',
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 2,
          parent_id: media.id,
          slug: parseSlug('Publikasi'),
          order: 2,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Publikasi',
                },
                {
                  language: 'en',
                  name: 'Publications',
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 2,
          parent_id: media.id,
          slug: parseSlug('Artikel'),
          order: 3,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Artikel',
                },
                {
                  language: 'en',
                  name: 'Articles',
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 2,
          parent_id: media.id,
          slug: parseSlug('Video'),
          order: 4,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Video',
                },
                {
                  language: 'en',
                  name: 'Video',
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 2,
          parent_id: media.id,
          slug: parseSlug('Hackathon'),
          order: 5,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Hackathon',
                },
                {
                  language: 'en',
                  name: 'Hackathon',
                }
              ]
            }
          }
        }
      }),
      // CSR
      prisma.menuItem.create({
        data: {
          level: 2,
          parent_id: csr.id,
          slug: parseSlug('Info CSR'),
          order: 1,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Info CSR',
                },
                {
                  language: 'en',
                  name: 'CSR Info',
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 2,
          parent_id: csr.id,
          slug: parseSlug('Galeri CSR'),
          order: 2,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Galeri CSR',
                },
                {
                  language: 'en',
                  name: 'CSR Gallery',
                }
              ]
            }
          }
        }
      }),
      // Pelaporan
      prisma.menuItem.create({
        data: {
          level: 2,
          parent_id: pelaporan.id,
          slug: parseSlug('Whistleblowing System'),
          order: 1,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Whistleblowing System',
                },
                {
                  language: 'en',
                  name: 'Whistleblowing System',
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 2,
          parent_id: pelaporan.id,
          slug: parseSlug('Gratifikasi'),
          order: 2,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Gratifikasi',
                },
                {
                  language: 'en',
                  name: 'Gratification',
                }
              ]
            }
          }
        }
      }),
    ])

    const [
      hResidenceAmethystKemayoran,
      theEnviro,
      hResidenceMtHaryono,
      kubikahomy,
      hCitySawangan,
      hMansionPejaten,
      harperHotel,
      habitareRasuna,
      astonPriority,
      upPeak,
      theHTower,
      hkTower,
    ] = await Promise.all([
      // Apartemen
      prisma.menuItem.create({
        data: {
          level: 3,
          parent_id: apartemen.id,
          slug: parseSlug('H Residence Amethyst Kemayoran'),
          order: 1,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'H Residence Amethyst Kemayoran',
                },
                {
                  language: 'en',
                  name: 'H Residence Amethyst Kemayoran',
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 3,
          parent_id: apartemen.id,
          slug: parseSlug('The Enviro'),
          order: 2,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'The Enviro',
                },
                {
                  language: 'en', 
                  name: 'The Enviro',
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 3,
          parent_id: apartemen.id,
          slug: parseSlug('H Residence MT Haryono'),
          order: 3,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'H Residence MT Haryono',
                },
                {
                  language: 'en',
                  name: 'H Residence MT Haryono', 
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 3,
          parent_id: apartemen.id,
          slug: parseSlug('Kubikahomy'),
          order: 4,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Kubikahomy',
                },
                {
                  language: 'en',
                  name: 'Kubikahomy',
                }
              ]
            }
          }
        }
      }),
      // Perumahan
      prisma.menuItem.create({
        data: {
          level: 3,
          parent_id: perumahan.id,
          slug: parseSlug('H City Sawangan'),
          order: 1,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'H City Sawangan',
                },
                {
                  language: 'en',
                  name: 'H City Sawangan', 
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 3,
          parent_id: perumahan.id,
          slug: parseSlug('H Mansion Pejaten'),
          order: 2,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'H Mansion Pejaten',
                },
                {
                  language: 'en',
                  name: 'H Mansion Pejaten',
                }
              ]
            }
          }
        }
      }),
      // Hotel
      prisma.menuItem.create({
        data: {
          level: 3,
          parent_id: hotel.id,
          slug: parseSlug('Harper Hotel'),
          order: 1,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Harper Hotel',
                },
                {
                  language: 'en',
                  name: 'Harper Hotel',
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 3,
          parent_id: hotel.id,
          slug: parseSlug('HABITARE Rasuna'),
          order: 2,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'HABITARE Rasuna',
                },
                {
                  language: 'en', 
                  name: 'HABITARE Rasuna',
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 3,
          parent_id: hotel.id,
          slug: parseSlug('Aston Priority'),
          order: 3,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'Aston Priority',
                },
                {
                  language: 'en',
                  name: 'Aston Priority', 
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 3,
          parent_id: hotel.id,
          slug: parseSlug('UP-PEAK'),
          order: 4,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'UP-PEAK',
                },
                {
                  language: 'en',
                  name: 'UP-PEAK',
                }
              ]
            }
          }
        }
      }),
      // Kantor
      prisma.menuItem.create({
        data: {
          level: 3,
          parent_id: kantor.id,
          slug: parseSlug('The H Tower'),
          order: 1,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'The H Tower',
                },
                {
                  language: 'en',
                  name: 'The H Tower',
                }
              ]
            }
          }
        }
      }),
      prisma.menuItem.create({
        data: {
          level: 3,
          parent_id: hotel.id,
          slug: parseSlug('HK Tower'),
          order: 2,
          primary: false,
          translations: {
            createMany: {
              data: [
                {
                  language: 'id',
                  name: 'HK Tower',
                },
                {
                  language: 'en', 
                  name: 'HK Tower',
                }
              ]
            }
          }
        }
      }),
    ])

  } catch (error) {
    throw error;
  }
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
