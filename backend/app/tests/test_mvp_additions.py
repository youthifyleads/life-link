import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services import dependencies as deps
from app.services.email_service import FakeEmailProvider

def auth(c,email,password):
 r=c.post('/api/v1/auth/login',json={'email':email,'password':password});assert r.status_code==200,r.text;return {'Authorization':'Bearer '+r.json()['access_token']}
@pytest.fixture(autouse=True)
def reset():
 deps.reset_all_repositories(); yield; deps.reset_all_repositories()
@pytest.fixture
def email_provider():
 p=FakeEmailProvider();app.dependency_overrides[deps.get_email_provider]=lambda:p;yield p;app.dependency_overrides.clear()
def test_signup_email_otp_refresh_and_unverified_block(email_provider):
 c=TestClient(app)
 r=c.post('/api/v1/auth/signup',json={'name':'New User','email':'new@example.com','phone':'01012345678','password':'Strong@123','date_of_birth':'2000-01-01'});assert r.status_code==201
 blocked=c.post('/api/v1/auth/login',json={'email':'new@example.com','password':'Strong@123'});assert blocked.status_code==401;assert blocked.json()['error']['code']=='ACCOUNT_INACTIVE'
 code=email_provider.sent[-1][1];v=c.post('/api/v1/auth/signup/verify',json={'email':'new@example.com','otp':code});assert v.status_code==200
 login=c.post('/api/v1/auth/login',json={'email':'new@example.com','password':'Strong@123'});assert login.status_code==200;assert login.json()['refresh_token']
 old=login.json()['refresh_token'];rot=c.post('/api/v1/auth/refresh',json={'refresh_token':old});assert rot.status_code==200;reuse=c.post('/api/v1/auth/refresh',json={'refresh_token':old});assert reuse.status_code==401;assert reuse.json()['error']['code']=='REFRESH_TOKEN_REUSE'
def test_signup_defaults_to_normal_user_and_optional_fields(email_provider):
 c=TestClient(app);r=c.post('/api/v1/auth/signup',json={'name':'Optional','email':'optional@example.com','phone':'01011111111','password':'Strong@123','date_of_birth':'1999-05-05'});assert r.status_code==201; code=email_provider.sent[-1][1];v=c.post('/api/v1/auth/signup/verify',json={'email':'optional@example.com','otp':code});assert v.status_code==200;assert v.json()['role']=='normal_user'
def test_password_reset_is_generic_and_revokes_refresh(email_provider):
 c=TestClient(app);h=auth(c,'hospital@lifelink.dev','Test@123');login=c.post('/api/v1/auth/login',json={'email':'hospital@lifelink.dev','password':'Test@123'});rt=login.json()['refresh_token'];r=c.post('/api/v1/auth/forgot-password',json={'email':'hospital@lifelink.dev'});assert r.status_code==200;assert 'hospital' not in r.json()['message'].lower();code=email_provider.sent[-1][1];x=c.post('/api/v1/auth/reset-password',json={'email':'hospital@lifelink.dev','code':code,'new_password':'NewPass@123'});assert x.status_code==200;assert c.post('/api/v1/auth/refresh',json={'refresh_token':rt}).status_code==401
def test_blood_bag_lifecycle_and_qr():
 c=TestClient(app);h=auth(c,'bloodbank@lifelink.dev','Test@123');r=c.post('/api/v1/blood-bags',headers=h,json={'blood_type':'O-','quantity':1,'collection_date':'2026-09-01','current_location':'Cairo'});assert r.status_code==201;bag=r.json();
 for st in ['reserved','allocated','in_transit','delivered','received']:
  x=c.patch(f"/api/v1/blood-bags/{bag['id']}/status",headers=h,json={'status':st});assert x.status_code==200
 hist=c.get(f"/api/v1/blood-bags/{bag['id']}/history",headers=h);assert hist.status_code==200;assert len(hist.json())==6
 qr=c.get(f"/api/v1/blood-bags/{bag['id']}/qr",headers=h).json()['qr_payload'];scan=c.post('/api/v1/blood-bags/scan',headers=h,json={'qr_code':qr});assert scan.status_code==200;assert scan.json()['blood_bag']['id']==bag['id'];assert len(scan.json()['movement_history'])==6
def test_invalid_blood_bag_transition_rejected():
 c=TestClient(app);h=auth(c,'bloodbank@lifelink.dev','Test@123');r=c.post('/api/v1/blood-bags',headers=h,json={'blood_type':'A+','quantity':1,'collection_date':'2026-09-01'});bid=r.json()['id'];x=c.patch(f'/api/v1/blood-bags/{bid}/status',headers=h,json={'status':'received'});assert x.status_code==409
def test_device_token_register_list_remove():
 c=TestClient(app);h=auth(c,'user@lifelink.dev','Test@123');p={'token':'fcm-device-token-12345','provider':'fcm'};assert c.post('/api/v1/notifications/devices',headers=h,json=p).status_code==201;assert len(c.get('/api/v1/notifications/devices',headers=h).json())==1;assert c.request('DELETE','/api/v1/notifications/devices',headers=h,json=p).status_code==200;assert c.get('/api/v1/notifications/devices',headers=h).json()==[]
