import { Repository, DeepPartial, FindOptionsWhere } from 'typeorm';
import { QueryParams, ResponseQuery } from '../interfaces/query.interface';

export class BaseDBService<T extends { id: any }> {
  constructor(protected readonly repository: Repository<T>) {}

  get repo(): Repository<T> {
    return this.repository;
  }

  async getItems(query: QueryParams): Promise<ResponseQuery<T>> {
    const { skip, limit, filter, sort } = query;

    const findOptions: any = {
      skip,
      take: limit,
      where: filter as FindOptionsWhere<T>,
    };

    if (sort) {
      findOptions.order = sort;
    }

    const [items, total] = await this.repository.findAndCount(findOptions);
    const pageIndex = limit > 0 ? Math.floor(skip / limit) + 1 : 1;

    return {
      items,
      total,
      size: limit,
      page: pageIndex,
      offset: skip,
    };
  }

  async getItemById(id: any): Promise<T | null> {
    return this.repository.findOne({ where: { id } as FindOptionsWhere<T> });
  }

  async insertItem(entity: DeepPartial<T>): Promise<T> {
    const newEntity = this.repository.create(entity);
    return this.repository.save(newEntity);
  }

  async updateItem(id: any, entity: DeepPartial<T>): Promise<T> {
    await this.repository.update(id, entity as any);
    const updated = await this.getItemById(id);
    if (!updated) {
      throw new Error(`Item with id ${id} not found after update`);
    }
    return updated;
  }

  async removeItem(id: any): Promise<boolean> {
    try {
      const result = await this.repository.delete(id);
      return (result.affected ?? 0) > 0;
    } catch (ex) {
      return false;
    }
  }

  async countByFilter(filter: FindOptionsWhere<T>): Promise<number> {
    return this.repository.count({ where: filter });
  }

  async insertMany(entities: DeepPartial<T>[]): Promise<T[]> {
    const created = this.repository.create(entities);
    return this.repository.save(created);
  }
}
