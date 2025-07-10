{pkgs}: {
  deps = [
    pkgs.nodePackages.prettier
    pkgs.jq
    pkgs.postgresql
  ];
}
