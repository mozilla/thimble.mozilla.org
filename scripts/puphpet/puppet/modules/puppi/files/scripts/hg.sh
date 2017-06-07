#!/bin/bash
# hg.sh - Made for Puppi

# All variables are exported
set -a 

# Sources common header for Puppi scripts
. $(dirname $0)/header || exit 10

# Show help
showhelp () {
    echo "This script performs the hg operations required by puppi::project::hg"
    echo "It integrates and uses variables provided by other core Puppi scripts"
    echo "It has the following options:"
    echo "-a <action> (Optional) What action to perform. Available options: deploy (default), rollback"
    echo "-s <source> (Required) Git source repo to use"
    echo "-d <destination> (Required) Directory where files are deployed"
    echo "-u <user> (Optional) User that performs the deploy operations. Default root"
    echo "-t <tag> (Optional) Tag to deploy"
    echo "-b <branch> (Optional) Branch to deploy"
    echo "-c <commit> (Optional) Commit to deploy"
    echo "-v <true|false> (Optional) If verbose"
    echo "-k <true|false> (Optional) If .hg dir is kept on deploy_root"
    echo 
    echo "Examples:"
    echo "hg.sh -a deploy -s $source -d $deploy_root -u $user -t $tag -b $branch -c $commit -v $bool_verbose -k $bool_keep_hgdata"
}

verbose="true"

# Check Arguments
while [ $# -gt 0 ]; do
  case "$1" in
    -a)
      case $2 in
          rollback)
          action="rollback"
          ;;
          *)
          action="install"
          ;;
      esac 
      shift 2 ;;
    -s)
      if [ $source ] ; then
        source=$source
      else
        source=$2
      fi
      shift 2 ;;
    -d)
      if [ $deploy_root ] ; then
        deploy_root=$deploy_root
      else
        deploy_root=$2
      fi
      shift 2 ;;
    -u)
      if [ $user ] ; then
        deploy_user=$user
      else
        deploy_user=$2
      fi
      shift 2 ;;
    -t)
      if [ $hg_tag ] ; then
        hg_tag=$hg_tag
      else
        hg_tag=$2
      fi
      shift 2 ;;
    -b)
      if [ $branch ] ; then
        branch=$branch
      else
        branch=$2
      fi
      shift 2 ;;
    -c)
      if [ $commit ] ; then
        commit=$commit
      else
        commit=$2
      fi
      shift 2 ;;
    -v)
      if [ $verbose ] ; then
        verbose=$verbose
      else
        verbose=$2
      fi
      shift 2 ;;
    -k)
      if [ $keep_hgdata ] ; then
        keep_hgdata=$keep_hgdata
      else
        keep_hgdata=$2
      fi
      shift 2 ;;
    *)
      showhelp
      exit ;;
  esac
done

if [ "x$verbose" == "xtrue" ] ; then
  verbosity="-v"
else
  verbosity=""
fi

cd /

hgdir=$deploy_root
if [ "x$keep_hgdata" != "xtrue" ] ; then
  if [ ! -d $archivedir/$project-hg ] ; then
    mkdir $archivedir/$project-hg
    chown -R $deploy_user:$deploy_user $archivedir/$project-hg
  fi
  hgdir=$archivedir/$project-hg/hgrepo
fi

do_install () {
  if [ -d $hgdir/.hg ] ; then
    cd $hgdir
    hg pull $verbosity origin $branch
    hg update $verbosity $branch
    if [ "x$?" != "x0" ] ; then
      hg update $verbosity $branch
    fi
  else
    hg clone $verbosity --branch $branch $source $hgdir
    cd $hgdir
  fi

  if [ "x$hg_tag" != "xundefined" ] ; then
    hg update $verbosity $hg_tag
  fi

  if [ "x$commit" != "xundefined" ] ; then
    hg update $verbosity $commit
  fi

  if [ "x$hgdir" == "x$archivedir/$project-hg" ] ; then
    rsync -a --exclude=".hg" $hgdir/$hgsubdir $deploy_root/
  fi

}

do_rollback () {

  echo "Rollback not yet supported"
}

# Action!
case "$action" in
    install) export -f do_install ; su $deploy_user -c do_install ;;
    rollback) do_rollback ;;
esac
