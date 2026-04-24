import prisma from '../db/client.js';

const KYC_STATUS = { PENDING: 'PENDING', APPROVED: 'APPROVED', REJECTED: 'REJECTED', UNDER_REVIEW: 'UNDER_REVIEW' };

class KYCCollector {
  async submitKYC(userId, data) {
    const required = ['fullName', 'dateOfBirth', 'nationality', 'documentType', 'documentNumber', 'address'];
    const missing = required.filter(f => !data[f]);
    if (missing.length) throw new Error(`Missing required KYC fields: ${missing.join(', ')}`);

    const dob = new Date(data.dateOfBirth);
    if (isNaN(dob.getTime())) throw new Error('dateOfBirth must be a valid date');

    return prisma.kYCRecord.upsert({
      where: { userId },
      create: {
        userId,
        status: KYC_STATUS.PENDING,
        fullName: data.fullName,
        dateOfBirth: dob,
        nationality: data.nationality,
        documentType: data.documentType,
        documentNumber: data.documentNumber,
        address: data.address,
        phoneNumber: data.phoneNumber ?? null,
        email: data.email ?? null,
      },
      update: {
        status: KYC_STATUS.PENDING,
        fullName: data.fullName,
        dateOfBirth: dob,
        nationality: data.nationality,
        documentType: data.documentType,
        documentNumber: data.documentNumber,
        address: data.address,
        phoneNumber: data.phoneNumber ?? null,
        email: data.email ?? null,
      },
    });
  }

  async getKYCRecord(userId) {
    return prisma.kYCRecord.findUnique({ where: { userId } });
  }

  async updateStatus(userId, status, note = null) {
    const record = await this.getKYCRecord(userId);
    if (!record) throw new Error(`KYC record not found for user ${userId}`);
    return prisma.kYCRecord.update({
      where: { userId },
      data: { status },
    });
  }

  async isVerified(userId) {
    const record = await this.getKYCRecord(userId);
    return record?.status === KYC_STATUS.APPROVED;
  }
}

export { KYC_STATUS };
export default new KYCCollector();
