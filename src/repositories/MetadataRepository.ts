import { Metadata } from '@/src/data/watermelondb/models';
import { Collection, Database, Q } from '@nozbe/watermelondb';

class MetadataRepository {
  private database: Database;
  private metadataCollection: Collection<Metadata>;

  constructor(database: Database) {
    this.database = database;
    this.metadataCollection = this.database.get<Metadata>('metadata');
  }

  async fetchMetadataByUri(uri: string): Promise<Metadata[]> {
    return await this.metadataCollection
      .query(Q.where('book_uri', uri))
      .fetch();
  }

  async createNewMetadata(
    uri: string,
    metadata: GoogleBooksMetadata
  ): Promise<Metadata> {
    return await this.database.write(async () => {
      const newMetadata = this.metadataCollection.prepareCreate(m => {
        m.title = metadata.title;
        m.bookUri = uri;
        m.subtitle = metadata.subtitle;
        m.author = metadata.author;
        m.publisher = metadata.publisher;
        m.language = metadata.language;
        m.publishedDate = metadata.publishedDate;
        m.description = metadata.description;
        m.pageCount = metadata.pageCount;
        m.categories = metadata.categories;
      });
      return newMetadata;
    });
  }

  /**
   * Bulk create metadata records
   */
  async createMetadataBatch(metadata: GoogleBooksMetadata[]): Promise<void> {
    await this.database.write(async () => {
      const creations = metadata.map(metadata =>
        this.metadataCollection.prepareCreate(m => {
          m.title = metadata.title;
          m.bookUri = metadata.uri;
          m.subtitle = metadata.subtitle;
          m.author = metadata.author;
          m.publisher = metadata.publisher;
          m.language = metadata.language;
          m.publishedDate = metadata.publishedDate;
          m.description = metadata.description;
          m.pageCount = metadata.pageCount;
          m.categories = metadata.categories;
        })
      );
      await this.database.batch(...creations);
    });
  }

  //   Update existing metadata Record
  async updateMetadata(
    existingMetadata: Metadata,
    newData: Partial<Metadata>
  ): Promise<Metadata> {
    return await this.database.write(async () => {
      const updatedMetadata = await existingMetadata.update(m => {
        if (newData.title !== undefined) m.title = newData.title;
        if (newData.subtitle !== undefined) m.subtitle = newData.subtitle;
        if (newData.author !== undefined) m.author = newData.author;
        if (newData.publisher !== undefined) m.publisher = newData.publisher;
        if (newData.language !== undefined) m.language = newData.language;
        if (newData.publishedDate !== undefined)
          m.publishedDate = newData.publishedDate;
        if (newData.description !== undefined)
          m.description = newData.description;
        if (newData.pageCount !== undefined) m.pageCount = newData.pageCount;
        if (newData.categories !== undefined) m.categories = newData.categories;
      });
      return updatedMetadata;
    });
  }

  // Delete metadata by URI
  async deleteMetadataByUri(uri: string): Promise<void> {
    const metadataToDelete = await this.fetchMetadataByUri(uri);
    if (metadataToDelete.length === 0) return;

    await this.database.write(async () => {
      for (const metadata of metadataToDelete) {
        await metadata.destroyPermanently();
      }
    });
  }
}

export default MetadataRepository;
