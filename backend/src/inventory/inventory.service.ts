import { Injectable } from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  // Adds a new Resource to PostgreSQL
  create(createInventoryDto: CreateInventoryDto) {
    return this.prisma.resource.create({
      data: createInventoryDto,
    });
  }

  // Gets all Resources (and includes their Organization details)
  findAll() {
    return this.prisma.resource.findMany({
      include: { organization: true },
    });
  }

  // Gets one Resource by its UUID string
  findOne(id: string) {
    return this.prisma.resource.findUnique({
      where: { id },
      include: { organization: true },
    });
  }

  // Updates a Resource by its UUID string
  update(id: string, updateInventoryDto: UpdateInventoryDto) {
    return this.prisma.resource.update({
      where: { id },
      data: updateInventoryDto,
    });
  }

  // Deletes a Resource by its UUID string
  remove(id: string) {
    return this.prisma.resource.delete({
      where: { id },
    });
  }
}