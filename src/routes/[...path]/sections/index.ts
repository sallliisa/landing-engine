// Dynamically import all data.ts files in subfolders (section code = folder name)
const dataModules = import.meta.glob('./*/data.ts');
const svelteModules = import.meta.glob('./*/*.svelte');

type SectionDataLoader = (sectionId: string) => Promise<any>;

const sectionLoaders: Record<string, SectionDataLoader> = {};
const sectionComponents: Record<string, () => Promise<any>> = {};

for (const path in dataModules) {
  // Extract section code from path: './general-banner/data.ts' => 'general-banner'
  const match = path.match(/\.\/([^/]+)\/data\.ts$/);
  if (match) {
    const sectionCode = match[1];
    sectionLoaders[sectionCode] = async (sectionId: string) => {
      const mod = await dataModules[path]() as { load: SectionDataLoader };
      return mod.load(sectionId);
    };
  }
}

for (const path in svelteModules) {
  // Extract section code from path: './general-banner/GeneralBanner.svelte' => 'general-banner'
  const match = path.match(/\.\/([^/]+)\/[^/]+\.svelte$/);
  if (match) {
    const sectionCode = match[1];
    sectionComponents[sectionCode] = svelteModules[path];
  }
}

export { sectionLoaders, sectionComponents };