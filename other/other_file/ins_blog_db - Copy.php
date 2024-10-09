<?php
include_once ('database.php');
$txttitle = $_POST['txttitle'];
$txtsubtitle = $_POST['txtsubtitle'];
$txtdescription = $_POST['txtdescription'];
$date = $_POST['date'];
$file_name = $_FILES['image']['name'];

if(isset($_FILES['image'])){
   if(!empty($file_name))
   {
      echo "<script>alert('hii');</script>";
    
  
   //  echo "hi";
    // alert("hi");
    $errors= array();
    $file_name = $_FILES['image']['name'];
   //  echo $file_name;
    $file_size = $_FILES['image']['size'];
    $file_tmp = $_FILES['image']['tmp_name'];
    $file_type = $_FILES['image']['type'];
    $exploded = explode('.', $_FILES['image']['name']);
    $last_element = end($exploded);
    $file_ext=strtolower($last_element);
   //  $file_ext=strtolower(end(explode('.',$_FILES['image']['name'])));
    
    $extensions= array("jpeg","jpg","png");
    
   //  $target_dir = "uploads/";
   //  $target_file = $target_dir . $filename;
   //  $file_ext = pathinfo($_FILES["uploadfile"]["name"],PATHINFO_EXTENSION);
   //  $temp_name=$_FILES["uploadfile"]["tmp_name"];
    //echo $target_file;
   //  $allowed_extensions = array("jpg","jpeg","png","gif");
   //  if(in_array($file_ext,$extensions))
   //  {
   //      echo "<script>alert('Invalid format. Only jpg / jpeg/ png /gif format allowed');</script>";
   //          $errors[]="extension not allowed, please choose a JPEG or PNG file.";
   //  }

    if(in_array($file_ext,$extensions)=== false){
       $errors[]="extension not allowed, please choose a JPEG or PNG file.";
       echo "<script>alert('Invalid format. Only jpg / jpeg/ png /gif format allowed');</script>";
    }
   if(empty($errors)==true) {
      $sql = "INSERT INTO `tbl_blog` (`title`, `sub_title`, `date`,`image`,`description`) VALUES 
            ( '$txttitle', '$txtsubtitle', '$date','$file_name', '$txtdescription')" or die (mysql_error());
       move_uploaded_file($file_tmp,"images/".$file_name);
       $rs = mysqli_query($conn, $sql);
      //  echo "Success";
      // header("Location: insert_blog.html");
      header('location:insert_blog.php?success='.$success);
    }
   }
 }
 else{
   $sql = "INSERT INTO `tbl_blog` (`title`, `sub_title`, `date`,`image`,`description`) VALUES 
         ( '$txttitle', '$txtsubtitle', '$date','', '$txtdescription')" or die (mysql_error());
         $rs = mysqli_query($conn, $sql);
          header("Location: insert_blog.html");
   //  print_r($errors);
   header('location:insert_blog.php?success='.$success);

 }
    mysqli_close($conn);
?>








