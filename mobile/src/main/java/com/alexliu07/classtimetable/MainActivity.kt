package com.alexliu07.classtimetable

import android.content.ContentResolver
import android.content.Context
import android.net.Uri
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.room.ColumnInfo
import androidx.room.Dao
import androidx.room.Database
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverter
import androidx.room.TypeConverters
import com.alexliu07.classtimetable.ui.theme.ClassTimetableTheme
import com.google.android.gms.wearable.DataMap
import com.google.android.gms.wearable.PutDataMapRequest
import com.google.android.gms.wearable.Wearable
import org.yaml.snakeyaml.Yaml
import java.time.LocalTime


class MainActivity : ComponentActivity() {
    @OptIn(ExperimentalMaterial3Api::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        val db = Room.databaseBuilder(applicationContext,AppDatabase::class.java,"data").allowMainThreadQueries().build()
        val dataDao = db.dataDao()
        setContent {
            ClassTimetableTheme {
                Scaffold(
                    topBar = {
                        TopAppBar(
                            colors = TopAppBarDefaults.topAppBarColors(
                                containerColor = MaterialTheme.colorScheme.primaryContainer,
                                titleContentColor = MaterialTheme.colorScheme.primary
                            ),
                            title = {
                                Text(
                                    text = stringResource(R.string.app_name),
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        )
                    }
                ) { innerPadding ->
                    MainApp(
                        db = dataDao,
                        modifier = Modifier.padding(innerPadding)
                    )
                }
            }
        }
    }
}

@Entity
data class Data(
    @PrimaryKey(autoGenerate = true) val id: Int? = null,
    @ColumnInfo val day: Int,
    @ColumnInfo val subject: String,
    @ColumnInfo val startTime: LocalTime,
    @ColumnInfo val endTime: LocalTime
)

class Converters{
    @TypeConverter
    fun fromLocalTime(time: LocalTime): String{
        return time.toString()
    }

    @TypeConverter
    fun toLocalTime(time: String): LocalTime{
        return LocalTime.parse(time)
    }
}

@Dao
interface DataDao{
    @Insert
    fun insert(data: Data)

    @Query("SELECT * FROM data WHERE day = :day")
    fun getData(day: Int): List<Data>

    @Query("SELECT * FROM data")
    fun getAll(): List<Data>

    @Query("DELETE FROM data")
    fun empty()

    @Query("DELETE FROM sqlite_sequence")
    fun resetPrimaryKey()

    @Query("SELECT (SELECT COUNT(*) FROM data) == 0")
    fun isEmpty(): Boolean
}

@Database(entities = [Data::class], version = 1)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase(){
    abstract fun dataDao(): DataDao
}

fun emptyDB(db: DataDao){
    db.empty()
    db.resetPrimaryKey()
}

fun parseSaveCSES(db: DataDao,uri: Uri,contentResolver: ContentResolver){
    val inputStream = contentResolver.openInputStream(uri)
    val yaml = Yaml()
    val data = yaml.load<Map<String,Any>>(inputStream)
    emptyDB(db)
//    val timetable = mutableListOf<MutableList<Data>>()
    val schedules = data["schedules"] as ArrayList<*>
//    for (i in 0..6)timetable.add(mutableListOf())
    for (i in 0..<schedules.size){
        val tempSchedule = schedules[i] as LinkedHashMap<*, *>
        val day = tempSchedule["enable_day"] as Int
        val classes = tempSchedule["classes"] as ArrayList<*>
        for(j in 0..<classes.size){
            val tempClassInfo = classes[j] as LinkedHashMap<*, *>
            val startTimeString = tempClassInfo["start_time"] as String
            val startTime = LocalTime.parse(startTimeString)
            val endTimeString = tempClassInfo["end_time"] as String
            val endTime = LocalTime.parse(endTimeString)
            val classData = Data(day=day-1, subject = tempClassInfo["subject"] as String, startTime = startTime, endTime = endTime)
//            timetable[day-1].add(classData)
            db.insert(classData)
        }
    }
//    for (i in 0..6)timetable[i].sortBy({it.startTime})
}

fun transferData(db: DataDao, context: Context, successText:String, failText: String){
    val dataClient = Wearable.getDataClient(context)
    val request = PutDataMapRequest.create("/data").run {
        val allData = db.getAll()
        val dataMaps = arrayListOf<DataMap>()
        for(data in allData){
            val tempDataMap = DataMap()
            tempDataMap.putInt("day",data.day)
            tempDataMap.putString("subject",data.subject)
            tempDataMap.putString("startTime",data.startTime.toString())
            tempDataMap.putString("endTime",data.endTime.toString())
            dataMaps.add(tempDataMap)
        }
        dataMap.putDataMapArrayList("data",dataMaps)
        asPutDataRequest()
    }.setUrgent()
    dataClient.putDataItem(request).addOnSuccessListener {
        Toast.makeText(context,successText,Toast.LENGTH_SHORT).show()
    }.addOnFailureListener {
        Toast.makeText(context,failText,Toast.LENGTH_SHORT).show()
    }

}

@Composable
fun MainApp(db: DataDao, modifier: Modifier = Modifier) {
    val showDialog = remember{ mutableStateOf(false)}
    val selectedUri = remember{ mutableStateOf<Uri?>(null)}
    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()){uri: Uri?->selectedUri.value = uri}
    val context = LocalContext.current
    val transferSuccessText = stringResource(R.string.transfer_success)
    val transferFailText = stringResource(R.string.transfer_fail)
    Column(
        modifier = modifier
    ){
        Button(
            onClick = {
                if(!db.isEmpty())showDialog.value = true
                else launcher.launch(arrayOf("application/yaml"))
            },
            modifier = Modifier.padding(top = 10.dp, start = 10.dp)
        ){ Text(stringResource(R.string.import_timetable))}
        Button(
            onClick = {transferData(db,context,transferSuccessText,transferFailText)},
            modifier = Modifier.padding(top = 10.dp, start = 10.dp)
        ){ Text(stringResource(R.string.transfer_to_watch))}
    }

    if(showDialog.value){
        AlertDialog(
            onDismissRequest = {showDialog.value = false},
            confirmButton = { TextButton(onClick = {
                showDialog.value = false
                launcher.launch(arrayOf("application/yaml"))
            }) { Text(stringResource(R.string.confirm)) } },
            dismissButton = { TextButton(onClick = {showDialog.value = false}) { Text(stringResource(
                R.string.cancel)) }},
            title = { Text(stringResource(R.string.timetable_already_exists)) },
            text = {Text(stringResource(R.string.overwrite_data))}
        )
    }
    selectedUri.value?.let {uri->
        parseSaveCSES(db,uri,context.contentResolver)
        Toast.makeText(context,stringResource(R.string.import_success),Toast.LENGTH_SHORT).show()
    }

}