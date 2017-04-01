#
# This class installs the cuda repo
#
class yum::repo::cuda (
  $baseurl = 'http://developer.download.nvidia.com/compute/cuda/repos/rhel$releasever/$basearch/'
) {

  yum::managed_yumrepo { 'cuda':
    descr    => 'NVIDIA Cuda for CentOS',
    baseurl  => $baseurl,
    enabled  => 1,
    gpgcheck => 0,
    priority => 90,
  }
}
