import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrgService {
  constructor(private prisma: PrismaService) {}

  async getBranches() {
    return this.prisma.branch.findMany({
      where: { isActive: true },
      include: { branchHours: true },
      orderBy: { name: 'asc' },
    });
  }
}
