#  Configure Twistlock

## General Prereq

Twistlock runs on N env  
Attached to the AD,
Access with VPN
Twistlock takes sometime ( 5 mins to scan it ) alternatively scan manually

### Onboarding  
* Needs a supported Registry with Read Access to  EKS, GCR, ECR cant auto discovery repositories
  
Configure Twistlock 
1. Create AD Group
    1. twistlock_<TEAM> ( only for the SSO part )
        1. Owner Project engineers
2. Create Collection
    1. Complete Images ( look on another one as example)
3. Configure Authentication on twistlock
    1. Go to groups
    2. Create a group same name convention as AD group  It will time out
    3. Give them ‘devsecops’
4. Configure Scan
    1. Defend/Vuln
        1. Registry Settings
            1. Add Registry
                1. COMPLETE RELEVANT DETAILS
