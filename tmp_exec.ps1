$ErrorActionPreference='Stop'
$base='http://localhost:8080'
function Req($m,$u,$h,$b){
 try{
  $p=@{Method=$m;Uri=$u;ErrorAction='Stop'}
  if($h){$p.Headers=$h}
  if($null -ne $b){$p.ContentType='application/json';$p.Body=($b|ConvertTo-Json -Compress -Depth 10)}
  $r=Invoke-WebRequest @p
  [pscustomobject]@{s=[int]$r.StatusCode;c=$r.Content}
 }catch{
  $sc='ERR';$ct=''
  if($_.Exception.Response){$resp=$_.Exception.Response;try{$sc=[int]$resp.StatusCode}catch{};try{$sr=New-Object IO.StreamReader($resp.GetResponseStream());$ct=$sr.ReadToEnd();$sr.Close()}catch{}}
  [pscustomobject]@{s=$sc;c=$ct}
 }
}
$u='user'+(Get-Random -Minimum 100000 -Maximum 999999)
$r1=Req 'POST' "$base/api/auth/register" $null @{nome='Teste';email="$u@example.com";username=$u;senha='Senha@123';cpf='52998224725'}
$tok=$null;try{$j=$r1.c|ConvertFrom-Json}catch{}
if($j){$tok=$j.token;if(-not $tok){$tok=$j.accessToken};if(-not $tok -and $j.data){$tok=$j.data.token};if(-not $tok){$tok=$j.jwt}}
"POST|/api/auth/register|$($r1.s)|"+$(if($tok){'token extraido'}else{'sem token'})
$h=@{};if($tok){$h=@{Authorization="Bearer $tok"}}
$r2=Req 'GET' "$base/api/auth/me" $h $null;"GET|/api/auth/me|$($r2.s)|ok"
$r3=Req 'GET' "$base/api/carrinho" $h $null;"GET|/api/carrinho|$($r3.s)|ok"
$r4=Req 'GET' "$base/api/carrinho/total" $h $null;"GET|/api/carrinho/total|$($r4.s)|ok"
$r5=Req 'GET' "$base/api/produtos" $h $null
$pid=$null;try{$pj=$r5.c|ConvertFrom-Json}catch{}
if($pj -is [array]){$f=$pj[0]}elseif($pj.items){$f=$pj.items[0]}elseif($pj.content){$f=$pj.content[0]}elseif($pj.data -is [array]){$f=$pj.data[0]}
if($f){$pid=$f.idProduto;if(-not $pid){$pid=$f.produtoId};if(-not $pid){$pid=$f.id}}
"GET|/api/produtos|$($r5.s)|"+$(if($pid){"idProduto=$pid"}else{'sem idProduto'})
if($pid){$r6=Req 'POST' "$base/api/carrinho/adicionar" $h @{produtoId=$pid;quantidade=1};"POST|/api/carrinho/adicionar|$($r6.s)|qtd=1"}else{"POST|/api/carrinho/adicionar|SKIP|produtoId ausente"}
