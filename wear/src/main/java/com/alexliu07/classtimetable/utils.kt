package com.alexliu07.classtimetable

import androidx.room.ColumnInfo
import androidx.room.Dao
import androidx.room.Database
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.RoomDatabase
import androidx.room.TypeConverter
import androidx.room.TypeConverters
import java.time.LocalTime
import java.util.Calendar

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

data class CurrentInfo(
    val status: Int,
    val current: String,
    val next: String,
    val progress: Int,
    val total: Int
)

fun getCurrentInfo(db: DataDao): CurrentInfo{
    val day = (Calendar.getInstance().get(Calendar.DAY_OF_WEEK)+5)%7
    val time = LocalTime.now()
    val todaySchedule = db.getData(day).sortedBy { it.startTime }
    if (todaySchedule.isEmpty())return CurrentInfo(0,"","",0,0)
    for (i in todaySchedule) {
        if(i.startTime.isAfter(time)){
            if(i == todaySchedule.first())return CurrentInfo(1,"",i.subject,0,0)
            val progress = time.toSecondOfDay()-todaySchedule[todaySchedule.indexOf(i)-1].endTime.toSecondOfDay()
            val total =  i.startTime.toSecondOfDay()-todaySchedule[todaySchedule.indexOf(i)-1].endTime.toSecondOfDay()
            return CurrentInfo(2,"",i.subject,progress,total)
        }
        if (i.startTime.isBefore(time) && i.endTime.isAfter(time)) {
            val current = i.subject
            val progress = time.toSecondOfDay() - i.startTime.toSecondOfDay()
            val total = i.endTime.toSecondOfDay() - i.startTime.toSecondOfDay()
            if (i == todaySchedule.last()) return CurrentInfo(3, current, "", progress,total)
            val next = todaySchedule[todaySchedule.indexOf(i) + 1].subject
            return CurrentInfo(4, current, next, progress,total)
        }
    }
    return CurrentInfo(0,"","",0,0)
}