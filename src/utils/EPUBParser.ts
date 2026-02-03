import * as FileSystem from 'expo-file-system';
import JSZip from 'jszip';
import { DOMParser } from 'xmldom';
import xpath from 'xpath';

// Standard EPUB interfaces
export interface EPUBMetadata {
  [key: string]: string | undefined;
}

export interface ManifestItem {
  href: string;
  mediaType: string;
}

export interface SpineItem {
  id: string;
  href: string;
}

export interface ParsedEPUB {
  metadata: EPUBMetadata;
  spine: SpineItem[];
  manifest: { [id: string]: ManifestItem };
}

export interface Chapter {
  index: number;
  id: string;
  href: string;
  content: string;
}

class EPUBParser {
  private zip: JSZip | null = null;
  private opfPath: string = '';
  private opfDir: string = '';
  private metadata: EPUBMetadata = {};
  private spine: SpineItem[] = [];
  private manifest: { [id: string]: ManifestItem } = {};

  constructor(private filePath: string) {}

  /**
   * Main Parsing Logic using Legacy FileSystem
   */
  async parse(): Promise<ParsedEPUB> {
    try {
      // 1. Ensure the URI is properly formatted for legacy methods
      let absoluteUri = this.filePath;
      if (
        !absoluteUri.startsWith('file://') &&
        !absoluteUri.startsWith('content://')
      ) {
        absoluteUri = `file://${absoluteUri}`;
      }

      // 2. Check if file exists (Legacy approach)
      const fileInfo = await FileSystem.getInfoAsync(absoluteUri);
      if (!fileInfo.exists) {
        throw new Error(`File does not exist at path: ${absoluteUri}`);
      }

      // 3. Read the EPUB file as base64 string
      const base64Data = await FileSystem.readAsStringAsync(absoluteUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 4. Load as ZIP
      this.zip = await JSZip.loadAsync(base64Data, { base64: true });

      // 5. Navigate internal EPUB structure
      await this.findOPFPath();
      await this.parseOPF();

      return {
        metadata: this.metadata,
        spine: this.spine,
        manifest: this.manifest,
      };
    } catch (error) {
      console.error('Error parsing EPUB:', error);
      throw error;
    }
  }

  private async findOPFPath(): Promise<void> {
    if (!this.zip) throw new Error('ZIP not loaded');

    const containerFile = this.zip.file('META-INF/container.xml');
    if (!containerFile) throw new Error('container.xml not found');

    const containerXML = await containerFile.async('string');
    const doc = new DOMParser().parseFromString(containerXML, 'text/xml');

    const select = xpath.useNamespaces({
      container: 'urn:oasis:names:tc:opendocument:xmlns:container',
    });

    const rootfileNode = select(
      '//container:rootfile/@full-path',
      doc
    ) as Attr[];

    if (rootfileNode.length > 0) {
      this.opfPath = rootfileNode[0].value;
      this.opfDir = this.opfPath.substring(
        0,
        this.opfPath.lastIndexOf('/') + 1
      );
    } else {
      throw new Error('OPF path not found in container.xml');
    }
  }

  private async parseOPF(): Promise<void> {
    if (!this.zip) throw new Error('ZIP not loaded');

    const opfFile = this.zip.file(this.opfPath);
    if (!opfFile) throw new Error('OPF file not found');

    const opfContent = await opfFile.async('string');
    const doc = new DOMParser().parseFromString(opfContent, 'text/xml');

    this.extractMetadata(doc);
    this.extractManifest(doc);
    this.extractSpine(doc);
  }

  private extractMetadata(doc: Document): void {
    const metadataNode = doc.getElementsByTagName('metadata')[0];
    if (!metadataNode) return;

    const getText = (tagName: string): string | undefined => {
      const elements = metadataNode.getElementsByTagName(tagName);
      if (elements.length > 0) return elements[0].textContent?.trim();

      const dcElements = metadataNode.getElementsByTagNameNS(
        'http://purl.org/dc/elements/1.1/',
        tagName
      );
      if (dcElements.length > 0) return dcElements[0].textContent?.trim();

      return undefined;
    };

    this.metadata = {
      title: getText('title'),
      creator: getText('creator'),
      publisher: getText('publisher'),
      language: getText('language'),
      identifier: getText('identifier'),
      date: getText('date'),
      description: getText('description'),
      rights: getText('rights'),
    };

    const metaTags = metadataNode.getElementsByTagName('meta');
    for (let i = 0; i < metaTags.length; i++) {
      const meta = metaTags[i];
      const name = meta.getAttribute('name') || meta.getAttribute('property');
      const content = meta.getAttribute('content');
      if (name && content) this.metadata[name] = content;
    }
  }

  private extractManifest(doc: Document): void {
    const manifestItems = doc
      .getElementsByTagName('manifest')[0]
      ?.getElementsByTagName('item');

    if (!manifestItems) return;

    for (let i = 0; i < manifestItems.length; i++) {
      const item = manifestItems[i];
      const id = item.getAttribute('id');
      const href = item.getAttribute('href');
      const mediaType = item.getAttribute('media-type');

      if (id && href && mediaType) {
        this.manifest[id] = {
          href: this.resolveHref(href),
          mediaType,
        };
      }
    }
  }

  private extractSpine(doc: Document): void {
    const spineItems = doc
      .getElementsByTagName('spine')[0]
      ?.getElementsByTagName('itemref');

    if (!spineItems) return;

    for (let i = 0; i < spineItems.length; i++) {
      const item = spineItems[i];
      const idref = item.getAttribute('idref');

      if (idref && this.manifest[idref]) {
        this.spine.push({
          id: idref,
          href: this.manifest[idref].href,
        });
      }
    }
  }

  private resolveHref(href: string): string {
    const cleanHref = href.split('#')[0];
    return this.opfDir + cleanHref;
  }

  async getChapterContent(chapterHref: string): Promise<string | null> {
    if (!this.zip) throw new Error('ZIP not loaded');
    try {
      const file = this.zip.file(chapterHref);
      return file ? await file.async('string') : null;
    } catch (error) {
      console.error(`Failed to load chapter: ${chapterHref}`, error);
      return null;
    }
  }

  async getCoverImage(): Promise<string | null> {
    if (!this.zip) throw new Error('ZIP not loaded');

    // Try standard EPUB cover metadata
    const coverId = this.metadata['cover'];
    if (coverId && this.manifest[coverId]) {
      const coverItem = this.manifest[coverId];
      const coverFile = this.zip.file(coverItem.href);

      if (coverFile) {
        const imageData = await coverFile.async('base64');
        return `data:${coverItem.mediaType};base64,${imageData}`;
      }
    }
    return null;
  }
}

export default EPUBParser;
