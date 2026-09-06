from datetime import datetime, timezone
from app.repositories.interfaces.donor_repository import DonorRepository
from app.repositories.models import *

class InMemoryDonorRepository(DonorRepository):
    def __init__(self):
        self.donors={}; self.donations={}; self.responses={}; self.consents={}; self.vouchers={}
    async def get_by_id(self, donor_id): return self.donors.get(donor_id)
    async def get_by_user_id(self, user_id): return next((x for x in self.donors.values() if x.user_id==user_id), None)
    async def create(self, donor): self.donors[donor.id]=donor; return donor
    async def update(self, donor): self.donors[donor.id]=donor; return donor
    async def list_all(self): return list(self.donors.values())
    async def list_donations(self, donor_id): return [x for x in self.donations.values() if x.donor_id==donor_id]
    async def create_donation(self, donation): self.donations[donation.id]=donation; return donation
    async def get_donation(self, donation_id): return self.donations.get(donation_id)
    async def list_responses(self, donor_id): return [x for x in self.responses.values() if x.donor_id==donor_id]
    async def create_response(self, response): self.responses[response.id]=response; return response
    async def create_consent(self, consent): self.consents[consent.id]=consent; return consent
    async def list_consents(self, donor_id): return [x for x in self.consents.values() if x.donor_id==donor_id]
    async def create_voucher(self, voucher): self.vouchers[voucher.id]=voucher; return voucher
    async def get_voucher_by_donation(self, donation_id): return next((x for x in self.vouchers.values() if x.donation_id==donation_id), None)
