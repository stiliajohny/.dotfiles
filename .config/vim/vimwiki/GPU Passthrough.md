
#### Specs

For reference this guide was appliacble to my machine, but should be applicable to those with any recent mainstream Intel CPU with integrated graphics and NVidia GPU.

Intel 8700K (Integrated graphics for Ubuntu Host)  
ASUS Strix Z370-F  
NVidia GeForce GTX 1080 (For Windows 10 Guest)  
32GB RAM (16 GB to Guest)  
Samsung NVMe 950 Pro SSD (For Windows 10 Guest)  
Samsung 850 EVO SSD (For Ubuntu Host)

#### Pre-requisites

Ensure Intel VT-d and Intel Virtualistion is enabled in your EFI/BIOS. Otherwise you'll end up with no ability to passthrough devices or have REALLY slow and unstable virtualistion with KVM/QEMU.

**DO NOT FORGET THIS STEP.** I spent two evenings smashing my head against the desk trying to work out why it was taking a 2 hours to install before the Windows Out Of Box Experience UI kept timing out. **CONSIDER YOURSELF WARNED!**  

> Computer illiterate user massively fails at computing - 2018 _(colourised)_.

#### Packages

Install the following packages  
`sudo apt install qemu-kvm libvirt-clients libvirt-daemon-system bridge-utils virt-manager ovmf`

#### Setup GPU Passthrough (VFIO/IOMMU)

Ensure you are not using Nvidia drivers and blacklist Nouveau, Ubuntu's built-in Open Source driver.

*   Create blacklist-nouveau.conf  
    `sudo nano /etc/modprobe.d/blacklist-nouveau.conf`

Include the following:

```
blacklist nouveau
options nouveau modeset=0

```

*   Edit GRUB entries  
    Open `sudo nano /etc/default/grub` and include `intel_iommu=on`  
    i.e.  
    `GRUB_CMDLINE_LINUX_DEFAULT="quiet splash intel_iommu=on"`
    
*   Update your GRUB config  
    `sudo update-grub`
    
*   Determine your PCI ID's for your GPU  
    Run `lspci -nn | grep -i nvidia`
    

You'll expect a return of something similar to this:

```
jack@Jack-PC:~$ lspci -nn | grep -i nvidia 
02:00.0 VGA compatible controller [0300]: NVIDIA Corporation GP104 [GeForce GTX 1080] [10de:1b80] (rev a1)
02:00.1 Audio device [0403]: NVIDIA Corporation GP104 High Definition Audio Controller [10de:10f0] (rev a1)

```

**Note it down!**

*   Add your kernel module for VFIO-PCI  
    `sudo nano /etc/modprobe.d/vfio.conf`  
    i.e.  
    `options vfio-pci ids=10de:1b80,10de:10f0`
    
*   Add an entry to automatically load the module  
    `sudo echo 'vfio-pci' > /etc/modules-load.d/vfio-pci.conf`
    
*   Regenerate the kernel initramfs  
    `sudo update-initramfs -u`
    

**Reboot your device!**

*   Confirm IOMMU is functioning.  
    `dmesg | grep -E "DMAR|IOMMU"`

This should return results!

*   Confirm VIFO is functioning.  
    `dmesg | grep -i vfio`

This also should return results!

### Creating your Virtual Machine with virt-manager and libvirt

*   Create your Virtual Machine within Virt-Manager.
*   Ensure you have at least 2 cores and 4096 MB RAM for Windows 10.
*   Grab the signed Fedora VirtIO Driver ISO from [https://docs.fedoraproject.org/quick-docs/en-US/creating-windows-virtual-machines-using-virtio-drivers.html](https://docs.fedoraproject.org/quick-docs/en-US/creating-windows-virtual-machines-using-virtio-drivers.html)

Customise your VM to ensure you have the following:

*   Chipset is Q35  
    _If your going to not use SPICE to passthrough your audio change the sound card from ich6 to ac97 - we'll get more into later._  
*   OVMF is used instead of BIOS for EFI functionality
*   Windows 10 ISO image as the source on a SATA CD Drive
*   Added a second SATA CD Drive and specified the VirtIO ISO image as the source on a second SATA CD Drive
*   Add the PCI devices for your NVidia Card and it's High Definition Audio Controller:  

#### Optional - Passthrough the Samsung 950 Pro SSD (or any NVMe SSD) you want Windows installed on.


#### Preventing the NVidia Code 43 Driver error.

Edit your libvirt config `sudo vish edit YourVmNameHere`

While between both `<features>` tags do the following:

*   Add `<vendor_id state='on' value='whatever'/>` between the `<hyperv>` tags.
*   Add `<hidden state='on'/>` between the KVM tags (or add the tags if not present).

i.e.

```
...
<features>
	<hyperv>
		...
		<vendor_id state='on' value='whatever'/>
		...
	</hyperv>
	...
	<kvm>
	<hidden state='on'/>
	</kvm>
</features>
...

```

#### Mitigating the crackling/fuzzing audio from the VM

These steps are to get the audio working and mitigate the crackling and fuzzing otherwise recieved with defaults. This in no way can clear everything but its _barely_ noticeable with the occasional quiet crackle just beyond hearing. Expect some _barely_ noticeable latency (~10ms) between images and sound, to an untrained ear you most likely would not notice anything different.

And before you ask... Yes, this is extremely playable for things like FPS games and what not.

*   Edit the qemu config `sudo nano /etc/libvirt/qemu.conf`

Seach and uncomment `user = "example"`  
Replace example with your username i.e. `user = "jack"`

*   Edit the pulse daemon config file `sudo /etc/pulse/daemon.conf`

Seach, uncomment and set values of the following:  
`default-sample-rate = 44100`  
`alternate-sample-rate = 48000`

*   Restart PulseAudio Service with `sudo pulseaudio -k` or reboot.
    
*   Edit your libvirt config `sudo vish edit YourVmNameHere`
    

At the very top of the config change `<domain type='kvm'>` to `<domain type='kvm' xmlns:qemu='http://libvirt.org/schemas/domain/qemu/1.0'>`

*   Add the following lines at the bottom of your config after the `</devices>` tag.

```
...
</devices>
  <qemu:env name='QEMU_AUDIO_DRV' value='pa'/>
  <qemu:env name='QEMU_PA_SAMPLES' value='8192'/>
  <qemu:env name='QEMU_AUDIO_TIMER_PERIOD' value='99'/>
  <qemu:env name='QEMU_PA_SERVER' value='/run/user/1000/pulse/native'/>
</domain>

```

The 1000 is Ubuntu's default user-id for the first user, if unsure or to double check use `id -u username` in a terminal, replace username with your actual username.

**Note:** you can also use ALSA by changing `<qemu:env name='QEMU_AUDIO_DRV' value='pa'/>` to `<qemu:env name='QEMU_AUDIO_DRV' value='alsa'/>`.

#### Optional - if not using a SPICE/VNC or other video device on the virtual machine aside from your GPU.

Modify the qemu config file `sudo nano /etc/libvirt/qemu.conf`.

Search for `vnc_allow_host_audio` uncomment and change 0 to 1 as so: `vnc_allow_host_audio = 1`.

Search for `nographics_allow_host_audio` uncomment and change 0 to 1 as so: `nographics_allow_host_audio = 1`.

If you do not do this step you will likely not be able to hear any audio in the Windows 10 guest despite enabling it in QEMU/libvirt.

### Run and install your Windows 10 VM via Virt-Manager

Ensure you add the virtio drivers on the install location screen before committing to the install.

#### Optional - If using the AC97 sound device

On first login to get the AC97 driver working you will need to grab the [Realtek AC97 drivers here](http://www.realtek.com.tw/Downloads/downloadsView.aspx?Langid=1&PNid=14&PFid=23&Level=4&Conn=3&DownTypeID=3&GetDown=false).

Extract the somewhere like the Downloads folder or the Desktop.

Open Settings, go to Update & Security, Choose Recovery in the left pane, Choose Advanced Start-up. On reboot you will be on the Advance Startup screen, choose Troubleshoot, Advanced Options, Choose Start Up Settings and then press the restart button.

Select option 7 to Disable the driver signature enforcement since we are installing an older driver.

Once back into windows go to Device Manager and locate the multimedia device without a driver and choose Update Driver software and opt to choose the driver location, ensure you go to the Realtek driver folder you extracted and select it.

Once installed go to Sound and select your Speakers, hit Properties, in the new window go to the Advanced tab and ensure the sample rate is set to 16 bit, 44100 HZ (CD Quality).

Hit ok and close.

##### Congratulations you now have a Windows 10 VM with a GPU running effectively at 1:1 performance as a physical machine!


### For reference see my Libvirt XML file:

```
<domain type='kvm' xmlns:qemu='http://libvirt.org/schemas/domain/qemu/1.0'>
  <name>win10</name>
  <uuid>5cf7d56b-7aa4-4177-b210-df55afabdd10</uuid>
  <memory unit='KiB'>16777216</memory>
  <currentMemory unit='KiB'>16777216</currentMemory>
  <vcpu placement='static'>12</vcpu>
  <os>
    <type arch='x86_64' machine='pc-q35-2.11'>hvm</type>
    <loader readonly='yes' type='pflash'>/usr/share/OVMF/OVMF_CODE.fd</loader>
    <nvram>/var/lib/libvirt/qemu/nvram/win10_VARS.fd</nvram>
    <bootmenu enable='yes'/>
  </os>
  <features>
    <acpi/>
    <apic/>
    <hyperv>
      <relaxed state='on'/>
      <vapic state='on'/>
      <spinlocks state='on' retries='8191'/>
      <vendor_id state='on' value='whatever'/>
    </hyperv>
    <kvm>
      <hidden state='on'/>
    </kvm>
    <vmport state='off'/>
  </features>
  <cpu mode='host-model' check='partial'>
    <model fallback='allow'/>
    <topology sockets='1' cores='6' threads='2'/>
  </cpu>
  <clock offset='localtime'>
    <timer name='rtc' tickpolicy='catchup'/>
    <timer name='pit' tickpolicy='delay'/>
    <timer name='hpet' present='no'/>
    <timer name='hypervclock' present='yes'/>
  </clock>
  <on_poweroff>destroy</on_poweroff>
  <on_reboot>restart</on_reboot>
  <on_crash>destroy</on_crash>
  <pm>
    <suspend-to-mem enabled='no'/>
    <suspend-to-disk enabled='no'/>
  </pm>
  <devices>
    <emulator>/usr/bin/kvm-spice</emulator>
    <disk type='file' device='cdrom'>
      <driver name='qemu' type='raw'/>
      <source file='/home/jack/Downloads/en_windows_10_consumer_edition_version_1803_updated_jul_2018_x64_dvd_12712603.iso'/>
      <target dev='sda' bus='sata'/>
      <readonly/>
      <boot order='1'/>
      <address type='drive' controller='0' bus='0' target='0' unit='0'/>
    </disk>
    <disk type='file' device='cdrom'>
      <driver name='qemu' type='raw'/>
      <source file='/home/jack/Downloads/virtio-win-0.1.149.iso'/>
      <target dev='sdb' bus='sata'/>
      <readonly/>
      <address type='drive' controller='0' bus='0' target='0' unit='1'/>
    </disk>
    <disk type='block' device='disk'>
      <driver name='qemu' type='raw'/>
      <source dev='/dev/disk/by-id/ata-WDC_WD2002FAEX-007BA0_WD-WCAY00892137'/>
      <target dev='hda' bus='virtio'/>
      <address type='pci' domain='0x0000' bus='0x04' slot='0x00' function='0x0'/>
    </disk>
    <disk type='block' device='disk'>
      <driver name='qemu' type='raw'/>
      <source dev='/dev/disk/by-id/ata-WDC_WD2003FZEX-00SRLA0_WD-WMC6N0J7TN94'/>
      <target dev='hdb' bus='virtio'/>
      <address type='pci' domain='0x0000' bus='0x05' slot='0x00' function='0x0'/>
    </disk>
    <disk type='block' device='disk'>
      <driver name='qemu' type='raw'/>
      <source dev='/dev/disk/by-id/ata-Samsung_SSD_840_EVO_500GB_S1DHNSADB54313V'/>
      <target dev='sdc' bus='virtio'/>
      <address type='pci' domain='0x0000' bus='0x0b' slot='0x00' function='0x0'/>
    </disk>
    <controller type='sata' index='0'>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x1f' function='0x2'/>
    </controller>
    <controller type='pci' index='0' model='pcie-root'/>
    <controller type='pci' index='1' model='pcie-root-port'>
      <model name='pcie-root-port'/>
      <target chassis='1' port='0x10'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x02' function='0x0' multifunction='on'/>
    </controller>
    <controller type='pci' index='2' model='dmi-to-pci-bridge'>
      <model name='i82801b11-bridge'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x1e' function='0x0'/>
    </controller>
    <controller type='pci' index='3' model='pci-bridge'>
      <model name='pci-bridge'/>
      <target chassisNr='3'/>
      <address type='pci' domain='0x0000' bus='0x02' slot='0x00' function='0x0'/>
    </controller>
    <controller type='pci' index='4' model='pcie-root-port'>
      <model name='pcie-root-port'/>
      <target chassis='4' port='0x11'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x02' function='0x1'/>
    </controller>
    <controller type='pci' index='5' model='pcie-root-port'>
      <model name='pcie-root-port'/>
      <target chassis='5' port='0x12'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x02' function='0x2'/>
    </controller>
    <controller type='pci' index='6' model='pcie-root-port'>
      <model name='pcie-root-port'/>
      <target chassis='6' port='0x13'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x02' function='0x3'/>
    </controller>
    <controller type='pci' index='7' model='pcie-root-port'>
      <model name='pcie-root-port'/>
      <target chassis='7' port='0x14'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x02' function='0x4'/>
    </controller>
    <controller type='pci' index='8' model='pcie-root-port'>
      <model name='pcie-root-port'/>
      <target chassis='8' port='0x15'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x02' function='0x5'/>
    </controller>
    <controller type='pci' index='9' model='pcie-root-port'>
      <model name='pcie-root-port'/>
      <target chassis='9' port='0x16'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x02' function='0x6'/>
    </controller>
    <controller type='pci' index='10' model='pcie-root-port'>
      <model name='pcie-root-port'/>
      <target chassis='10' port='0x17'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x02' function='0x7'/>
    </controller>
    <controller type='pci' index='11' model='pcie-root-port'>
      <model name='pcie-root-port'/>
      <target chassis='11' port='0x18'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x03' function='0x0'/>
    </controller>
    <controller type='virtio-serial' index='0'>
      <address type='pci' domain='0x0000' bus='0x06' slot='0x00' function='0x0'/>
    </controller>
    <controller type='usb' index='0' model='ich9-ehci1'>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x1d' function='0x7'/>
    </controller>
    <controller type='usb' index='0' model='ich9-uhci1'>
      <master startport='0'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x1d' function='0x0' multifunction='on'/>
    </controller>
    <controller type='usb' index='0' model='ich9-uhci2'>
      <master startport='2'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x1d' function='0x1'/>
    </controller>
    <controller type='usb' index='0' model='ich9-uhci3'>
      <master startport='4'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x1d' function='0x2'/>
    </controller>
    <interface type='network'>
      <mac address='52:54:00:4f:37:07'/>
      <source network='default'/>
      <model type='virtio'/>
      <address type='pci' domain='0x0000' bus='0x01' slot='0x00' function='0x0'/>
    </interface>
    <serial type='pty'>
      <target type='isa-serial' port='0'>
        <model name='isa-serial'/>
      </target>
    </serial>
    <console type='pty'>
      <target type='serial' port='0'/>
    </console>
    <channel type='spicevmc'>
      <target type='virtio' name='com.redhat.spice.0'/>
      <address type='virtio-serial' controller='0' bus='0' port='1'/>
    </channel>
    <input type='tablet' bus='usb'>
      <address type='usb' bus='0' port='1'/>
    </input>
    <input type='mouse' bus='ps2'/>
    <input type='keyboard' bus='ps2'/>
    <sound model='ac97'>
      <address type='pci' domain='0x0000' bus='0x03' slot='0x01' function='0x0'/>
    </sound>
    <hostdev mode='subsystem' type='pci' managed='yes'>
      <source>
        <address domain='0x0000' bus='0x06' slot='0x00' function='0x0'/>
      </source>
      <boot order='2'/>
      <address type='pci' domain='0x0000' bus='0x07' slot='0x00' function='0x0'/>
    </hostdev>
    <hostdev mode='subsystem' type='pci' managed='yes'>
      <source>
        <address domain='0x0000' bus='0x02' slot='0x00' function='0x0'/>
      </source>
      <address type='pci' domain='0x0000' bus='0x08' slot='0x00' function='0x0'/>
    </hostdev>
    <hostdev mode='subsystem' type='pci' managed='yes'>
      <source>
        <address domain='0x0000' bus='0x02' slot='0x00' function='0x1'/>
      </source>
      <address type='pci' domain='0x0000' bus='0x09' slot='0x00' function='0x0'/>
    </hostdev>
    <hostdev mode='subsystem' type='usb' managed='yes'>
      <source>
        <vendor id='0x2912'/>
        <product id='0x30c8'/>
      </source>
      <address type='usb' bus='0' port='6'/>
    </hostdev>
    <hostdev mode='subsystem' type='usb' managed='yes'>
      <source>
        <vendor id='0x1b1c'/>
        <product id='0x1b2e'/>
      </source>
      <address type='usb' bus='0' port='5'/>
    </hostdev>
    <hostdev mode='subsystem' type='usb' managed='yes'>
      <source>
        <vendor id='0x1b1c'/>
        <product id='0x1b33'/>
      </source>
      <address type='usb' bus='0' port='4'/>
    </hostdev>
    <redirdev bus='usb' type='spicevmc'>
      <address type='usb' bus='0' port='2'/>
    </redirdev>
    <redirdev bus='usb' type='spicevmc'>
      <address type='usb' bus='0' port='3'/>
    </redirdev>
    <memballoon model='virtio'>
      <address type='pci' domain='0x0000' bus='0x0a' slot='0x00' function='0x0'/>
    </memballoon>
  </devices>
  <qemu:commandline>
    <qemu:env name='QEMU_AUDIO_DRV' value='alsa'/>
    <qemu:env name='QEMU_PA_SAMPLES' value='8192'/>
    <qemu:env name='QEMU_AUDIO_TIMER_PERIOD' value='99'/>
    <qemu:env name='QEMU_PA_SERVER' value='/run/user/1000/pulse/native'/>
  </qemu:commandline>
</domain>
```


