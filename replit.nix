{pkgs}: {
  deps = [
    pkgs.zip
    pkgs.nodePackages.prettier
    pkgs.jq
    pkgs.postgresql
  ];
}
