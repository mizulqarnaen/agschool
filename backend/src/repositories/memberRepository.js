import { JsonRepository } from './baseRepository.js';

export class MemberRepository extends JsonRepository {
  constructor() {
    super('members.json');
  }

  getActiveMembers() {
    return this.readAll().filter(m => m.status === 'active');
  }
}

export const memberRepository = new MemberRepository();
